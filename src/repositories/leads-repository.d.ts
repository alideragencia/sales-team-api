import { InstagramQueueTask, InstagramQueueTaskStatus, Lead } from "@prisma/client";

type GetByContactDataProps = {
    email?: string
    phone?: string
    mobilephone?: string
}

export interface ILeadsRepository {

    getByBatch(batch: string): Promise<Lead[]>

    create(leads: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<void>

    getByContactData({ email, phone, mobilephone }): Promise<Lead | null>

}