export interface M2OTuple {
    id: number
    displayName: string
}

export interface Task {
    id: number
    displayName: string
    projectId: M2OTuple | null
    stageId: M2OTuple | null
    userIds: M2OTuple[]
    reviewerId: M2OTuple | null
    xOwnerId: M2OTuple | null
    mntSubscriptionId: M2OTuple | null
    partnerId: M2OTuple | null
    allocatedHours: number
    effectiveHours: number
    remainingHours: number
}

export interface Timesheet {
    id: number
    name: string
    unitAmount : number
    user: User
    billable: boolean
}


export interface User {
    id: number
    name: string
    username: string
    avatarUrl: string
}

export type Domain = (ThisType<string>[] | string | number | boolean)[] 

export interface Timer {
    taskId: number
    start: Date
}

