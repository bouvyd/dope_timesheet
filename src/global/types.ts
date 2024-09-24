interface M2OTuple {
    id: number
    displayName: string
}

export interface Task {
    id: number
    displayName: string
    projectId: M2OTuple
    stageId: M2OTuple
    userIds: M2OTuple[]
    reviewerId: M2OTuple
    xOwnerId: M2OTuple
}

export interface UserInfo {
    id: string
    name: string
    username: string
    avatarUrl: string
}

export type Domain = (ThisType<string>[] | string)[]