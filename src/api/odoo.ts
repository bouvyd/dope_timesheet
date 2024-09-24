import { Domain, Task, UserInfo } from '../global/types'

const TASK_FIELDS = ["id", "display_name", "project_id", "stage_id", "x_owner_id", "user_ids", "reviewer_id"]

class OdooAPI {
    private static baseUrl = 'https://www.odoo.com';
    private _uid: string;

    constructor(uid: string) {
        this._uid = uid;
    }

    get uid(): string {
        return this._uid;
    }

    set uid(uid: string) {
        this._uid = uid;
    }

    get assigneeDomain(): Domain {
        return ['user_ids', 'in', this.uid];
    }

    get reviewerDomain(): Domain {
        return ['reviewer_id', '=', this.uid];
    }

    get ownerDomain(): Domain {
        return ['x_owner_id', '=', this.uid];
    }

    expressionOr(domains: Domain[]): Domain {
        const numDomains = domains.length;
        const ors = Array(numDomains - 1).fill('|');
        return [...ors, ...domains];
    }
    
    public async getUserInfo(): Promise<UserInfo> {
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
        const user: UserInfo = {
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
        const domain = this.expressionOr(domains);
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
                    method: 'search_read',
                    args: [
                        domain,
                    ],
                    kwargs: {
                        fields: TASK_FIELDS,
                        limit: 10,
                        order: 'date_last_stage_update  desc'
                    }
                }
            })
        })
        const jsonResponse = await taskRequest.json();
        const tasks = [];
        for (const task of jsonResponse.result) {
            tasks.push({
                id: task.id,
                displayName: task.display_name,
                projectId: task.project_id,
                stageId: task.stage_id,
                userIds: task.user_ids,
                reviewerId: task.reviewer_id,
                xOwnerId: task.x_owner_id
            })
        }
        return tasks;
    }
}

export const odooApi = new OdooAPI('');