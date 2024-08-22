import { prisma } from "@/services/database";
import { IInstagramQueueTasksRepository } from "../instagram-queue-tasks-repository";
import { InstagramQueueTask, InstagramQueueTaskStatus } from "@prisma/client";


export class PrismaInstagramQueueTasksRepository implements IInstagramQueueTasksRepository {



    async getByStatus(status: InstagramQueueTaskStatus | InstagramQueueTaskStatus[]) {

        if (typeof status == 'string') {
            const tasks = await prisma.instagramQueueTask.findMany({ where: { status }, include: { logs: true } });
            return tasks;
        }
        const tasks = await prisma.instagramQueueTask.findMany({
            where: { OR: status.map(status => ({ status })) },
            include: {
                logs: true
            }
        });
        return tasks;

    }

    async update(id: string, data: Partial<InstagramQueueTask>) {
        await prisma.instagramQueueTask.update({ where: { id }, data });
    }

    async updateByArg(arg: string, data: Partial<InstagramQueueTask>) {
        await prisma.instagramQueueTask.updateMany({ where: { arg }, data });
    }

    async getByArg(arg: string) {
        const task = await prisma.instagramQueueTask.findFirst({ where: { arg } });
        return task;
    }
}