

export type InstagramQueueStatus = 'pending' | 'scraping' | 'complete' | 'stopped_by_system' | 'paused'
export type InstagramQueueAction = 'followers'

export interface Timestamp {
    seconds: number
    nanoseconds: number
}

export type RedriveInstagramQueueTask = {

    doc?: string

    followersCount: number
    countryCode: string

    createdAt: Timestamp

    logs: any[]
    completed: boolean
    queuePosition: number
    bio: string

    status: InstagramQueueStatus

    arg: string
    tags: string[]
    mediaId: string
    owner: string
    action: InstagramQueueAction
    totalFollowers: number
    newCached: number
    image: string
    pagination: string
    countryName: string

    lockedUntil: Timestamp

    alreadyCached: number
    active: boolean
    bulkIds: any[]
    stoped: boolean
    totalLeads: number
    totalFollowings: number
    pod: string

}
