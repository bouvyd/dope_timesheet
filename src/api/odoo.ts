import { Domain, Task, User, Timesheet, M2OTuple } from '../global/types'
import { camelCasify } from '../utils/apiUtils';
import readSpecs from './readSpecs.json'


class OdooAPI {
    private static _baseUrl = 'https://www.test.odoo.com';
    private _uid: number;

    constructor(uid: number) {
        this._uid = uid;
    }

    get uid(): number {
        return this._uid;
    }

    set uid(uid: number) {
        this._uid = uid;
    }

    get assigneeDomain(): Domain {
        return ['user_ids', 'in', [this.uid]];
    }

    get reviewerDomain(): Domain {
        return ['reviewer_id', '=', this.uid];
    }

    get ownerDomain(): Domain {
        return ['x_owner_id', '=', this.uid];
    }

    static get baseDomain(): Domain {
        return [['date_last_stage_update', '!=', false], ['display_in_project', '=', true], ['is_closed', '=', false]];
    }

    static get baseUrl(): string {
        return this._baseUrl;
    }

    expressionOr(domains: Domain[]): Domain {
        const numDomains = domains.length;
        const ors = Array(numDomains - 1).fill('|');
        return [...ors, ...domains];
    }
    
    public async getUserInfo(): Promise<User> {
        const sessionInfoRequest = await fetch(`${OdooAPI.baseUrl}/web/session/get_session_info`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            }
        );
        const session_info = await sessionInfoRequest.json();
        if (session_info.error) {
            throw new Error(session_info.error.message);
        }
        const user: User = {
            id: session_info.result.uid,
            name: session_info.result.name,
            username: session_info.result.username.includes('@') ? session_info.result.username.split('@')[0] : session_info.result.username,
            avatarUrl: `${OdooAPI.baseUrl}/web/image/res.users/${session_info.result.uid}/avatar_128`
        }
        return user;
    }

    public async getTasks(assignee: boolean = true, reviewer: boolean = true, owner: boolean = true): Promise<Task[]> {
        const domains: Domain[] = [];
        if (assignee) {
            domains.push(this.assigneeDomain);
        }
        if (reviewer) {
            domains.push(this.reviewerDomain);
        }
        if (owner) {
            domains.push(this.ownerDomain);
        }
        const domain = [...OdooAPI.baseDomain, ...this.expressionOr(domains)];
        const taskRequest = await fetch(`${OdooAPI.baseUrl}/web/dataset/call_kw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: 1,
                jsonrpc: '2.0',
                method: 'call_kw',
                params: {
                    model: 'project.task',
                    method: 'web_search_read',
                    args: [],
                    kwargs: {
                        domain: domain,
                        specification: readSpecs.task,
                        limit: null,
                        order: 'date_last_stage_update desc'
                    }
                }
            })
        })
        const jsonResponse = await taskRequest.json();
        const tasks: Task[] = [];
        for (const task of jsonResponse.result.records) {
            const userIds = task.user_ids as M2OTuple[]
            const parsedTask = camelCasify(task) as unknown as Task
            parsedTask.userIds = userIds
            tasks.push(parsedTask)
        }
        return tasks;
    }

    public async getTaskTimesheet(taskId: number): Promise<Timesheet[]> {
        const domain: Domain[] = [['task_id', '=', taskId]]
        const timesheetRequest = await fetch(`${OdooAPI.baseUrl}/web/dataset/call_kw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: 1,
                jsonrpc: '2.0',
                method: 'call_kw',
                params: {
                    model: 'account.analytic.line',
                    method: 'web_search_read',
                    args: [],
                    kwargs: {
                        domain: domain,
                        specification: readSpecs.timesheet,
                        order: 'user_id desc'
                    }
                }
            })
        })
        const jsonResponse = await timesheetRequest.json();
        const timesheets: Timesheet[] = [];
        for (const timesheet of jsonResponse.result.records) {
            timesheets.push({
                id: timesheet.id,
                name: timesheet.name,
                unitAmount: timesheet.unit_amount,
                user: {
                    id: timesheet.user_id.id,
                    name: timesheet.user_id.display_name,
                    username: timesheet.user_id.login,
                    avatarUrl: `${OdooAPI.baseUrl}/web/image/res.users/${timesheet.user_id.id}/avatar_128`
                },
                billable: timesheet.timesheet_invoice_type !== 'non_billable'
            })
        }
        return timesheets;
    }
}

export { OdooAPI };
export default new OdooAPI(0);
