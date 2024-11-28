

export type InstagramQueueStatus = 'pending' | 'scraping' | 'complete' | 'stopped_by_system'
export type InstagramQueueAction = 'followers'

export interface Timestamp {
    seconds: number
    nanoseconds: number
}

export type RedriveLead = {

    firstname: string
    lastname?: string
    phone?: string
    mobilephone?: string
    tags: string[]
    email?: string
    instagram: string
    biography?: string

    createdAt: Timestamp
    updatedAt: Timestamp

    leadOwner: string
    pk: string
    doc: string

}
