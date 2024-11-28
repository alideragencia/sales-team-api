import { Task } from "@prisma/client";

export interface ITasksRepository {

    getWaitingTasks(): Promise<Task[]>

    update(id: string, data: Partial<Task>): Promise<void>

}