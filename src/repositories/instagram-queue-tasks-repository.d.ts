import { InstagramScrappingTask, InstagramScrappingTaskStatus } from "@prisma/client";



export interface IInstagramQueueTasksRepository {

    create: (data: Pick<InstagramScrappingTask, 'arg' | 'type' | 'batch' | 'tags', 'isAssignedToSalesTeam'>) => Promise<InstagramQueueTask>

    getByStatus: (status: InstagramScrappingTaskStatus | InstagramScrappingTaskStatus[]) => Promise<InstagramScrappingTask[]>

    update: (id: string, data: Partial<InstagramScrappingTask>) => Promise<void>

    updateByArg: (arg: string, data: Partial<InstagramScrappingTask>) => Promise<void>

    getByArg: (arg: string) => Promise<InstagramScrappingTask | null>
    getByBatch: (batch: string) => Promise<InstagramScrappingTask[] | null>
    getBatches: ({ isAssignedToSalesTeam }: { isAssignedToSalesTeam?: boolean }) => Promise<string[]>

    getFailedTasksToVerify: () => Promise<InstagramScrappingTask[] | null>

}