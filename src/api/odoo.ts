import { Domain, Task, User, Timesheet, M2OTuple, Timer, OdooError, OdooResponse } from '../global/types'
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

    private async _submitTimers(timers: Timer[]): Promise<OdooResponse> {
        // save as analytic lines (timesheet entries) on the corresponding task/project
        const res = await fetch(`${OdooAPI.baseUrl}/web/dataset/call_kw`, {
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
                    method: 'create',
                    args: [timers.map(timer => ({
                            task_id: timer.resourceType === 'task' ? timer.resourceId : null,
                            project_id: timer.resourceType === 'project' ? timer.resourceId : null,
                            name: timer.description,
                            // convert duration to hours
                            unit_amount: timer.previousDuration / 60,
                            user_id: this.uid
                        }))
                    ],
                    kwargs: {}
                }
            })
        })
        return await res.json();
    }

    public async submitTimers(timers: Timer[]): Promise<Timer[]> {
        // save as analytic lines (timesheet entries) on the corresponding task/project
        const res = await this._submitTimers(timers);
        if (res.error) {
            if (timers.length === 1) {
                const odooError = res.error as OdooError;
                console.error('Failed to submit timer', timers[0], odooError);
                timers[0].error = odooError.data.message;
                return timers;
            }
            console.error('Failed to submit timers', res.error);
            // let's retry submitting the timers one by one and return the ones that failed
            const failedTimers = [];
            for (const timer of timers) {
                const res = await this._submitTimers([timer]);
                if (res.error) {
                    const odooError = res.error as OdooError;
                    console.error('Failed to submit timer', timer, odooError);
                    timer.error = odooError.data.message;
                    failedTimers.push(timer);
                }
            }
            return failedTimers;
        }
        return [];
    }

    public async getFavoriteInfo(id: number, type: 'task' | 'project'): Promise<M2OTuple | null> {
        const res = await fetch(`${OdooAPI.baseUrl}/web/dataset/call_kw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: 1,
                jsonrpc: '2.0',
                method: 'call_kw',
                params: {
                    model: type === 'task' ? 'project.task' : 'project.project',
                    method: 'read',
                    args: [[id], ["id", "display_name"]],
                    kwargs: {}
                }
            })
        })
        const jsonResponse = await res.json();
        if (jsonResponse.result.length === 0) {
            return null;
        }
        return camelCasify(jsonResponse.result[0]) as unknown as M2OTuple;
    }
}

export { OdooAPI };
export default new OdooAPI(0);
