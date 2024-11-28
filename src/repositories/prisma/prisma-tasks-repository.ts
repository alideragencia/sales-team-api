import { Task } from "@prisma/client";
import { ITasksRepository } from "../tasks-repository";
import { prisma } from "@/services/database";

export class PrismaTasksRepository implements ITasksRepository {

    async getWaitingTasks() {
        return await prisma.task.findMany({
            where: {
                status: 'WAITING',
                runAt: { lte: new Date() }
            }
        })
    }

    async update(id: string, data: Partial<Task>) {
        await prisma.task.update({
            where: { id },
            data
        })
    }

    async create(data: {
        key: Task['key'];
        data: object;
        runAt: Date;
    }) {
        await prisma.task.create({ data });
    }
}