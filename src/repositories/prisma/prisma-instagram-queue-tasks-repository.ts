import { prisma } from "@/services/database";
import { IInstagramQueueTasksRepository } from "../instagram-queue-tasks-repository";
import { InstagramScrappingTask, InstagramScrappingTaskStatus } from "@prisma/client";


export class PrismaInstagramQueueTasksRepository implements IInstagramQueueTasksRepository {

    async create(data: Pick<InstagramScrappingTask, 'arg' | 'batch' | 'type' | 'tags'>) {

        const tasks = await prisma.instagramScrappingTask.create({
            data: { ...data, isAssignedToSalesTeam: true }
        });
        return tasks;

    }

    async getByStatus(status: InstagramScrappingTaskStatus | InstagramScrappingTaskStatus[]) {

        const tasks = await prisma.instagramScrappingTask.findMany({
            where: typeof status == 'string' ? { status } : ({ OR: status.map(status => ({ status })) }),
            include: {
                logs: true
            }
        });
        return tasks;

    }

    async update(id: string, data: Partial<InstagramScrappingTask>) {
        await prisma.instagramScrappingTask.update({ where: { id }, data });
    }

    async updateByArg(arg: string, data: Partial<InstagramScrappingTask>) {
        await prisma.instagramScrappingTask.updateMany({ where: { arg }, data });
    }

    async getByArg(arg: string) {
        const task = await prisma.instagramScrappingTask.findFirst({ where: { arg } });
        return task;
    }

    async getByBatch(batch: string) {
        const tasks = await prisma.instagramScrappingTask.findMany({ where: { batch } });
        return tasks;
    }

    async getBatches({ isAssignedToSalesTeam }: { isAssignedToSalesTeam?: boolean } = { isAssignedToSalesTeam: false }) {

        const where = isAssignedToSalesTeam ? { isAssignedToSalesTeam: true } : {}

        const batches = await prisma.instagramScrappingTask.findMany({
            distinct: ['batch'],
            orderBy: { createdAt: 'desc' },
            select: {
                batch: true,
            },
            where: where
        })

        return batches.map(b => b.batch);
    }

    async getFailedTasksToVerify() {

        const tasks = await prisma.instagramScrappingTask.findMany({
            where: {
                status: 'FAILED',
                logs: {
                    none: {
                        event: 'FAILURE_CHECK'
                    }
                },
                isAssignedToSalesTeam: true
            }
        });

        return tasks

    }

}