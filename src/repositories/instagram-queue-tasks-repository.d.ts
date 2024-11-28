import { InstagramQueueTask, InstagramQueueTaskStatus } from "@prisma/client";

export interface IInstagramQueueTasksRepository {

    create: (data: Pick<InstagramQueueTask, 'arg' | 'type' | 'batch' | 'tags'>) => Promise<InstagramQueueTask>

    getByStatus: (status: InstagramQueueTaskStatus | InstagramQueueTaskStatus[]) => Promise<InstagramQueueTask[]>

    update: (id: string, data: Partial<InstagramQueueTask>) => Promise<void>

    updateByArg: (arg: string, data: Partial<InstagramQueueTask>) => Promise<void>

    getByArg: (arg: string) => Promise<InstagramQueueTask | null>
    getByBatch: (batch: string) => Promise<InstagramQueueTask[] | null>
    getBatches: ({ isAssignedToSalesTeam }: { isAssignedToSalesTeam?: boolean }) => Promise<string[]>

    getFailedTasksToVerify: () => Promise<InstagramQueueTask[] | null>

}