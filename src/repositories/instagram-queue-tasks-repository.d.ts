import { InstagramQueueTask, InstagramQueueTaskStatus } from "@prisma/client";


export interface IInstagramQueueTasksRepository {

    getByStatus: (status: InstagramQueueTaskStatus | InstagramQueueTaskStatus[]) => Promise<InstagramQueueTask[]>

    update: (id: string, data: Partial<InstagramQueueTask>) => Promise<void>

    updateByArg: (arg: string, data: Partial<InstagramQueueTask>) => Promise<void>

    getByArg: (arg: string) => Promise<InstagramQueueTask | null>

}