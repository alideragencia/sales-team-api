


import { RedriveProvider } from '@/providers/redrive';
import { PrismaInstagramQueueTasksRepository } from '@/repositories/prisma/prisma-instagram-queue-tasks-repository';
import { HandleInstagramQueueUseCase } from '@/use-cases/handle-instagram-queue';

import { Request, Response } from 'express';

export async function scrapperQueues(request: Request, response: Response) {

    console.log('Received a request to run queue ------');

    const data = await new HandleInstagramQueueUseCase(
        new RedriveProvider(),
        new PrismaInstagramQueueTasksRepository(),
    ).execute()

    console.log(data)

    return response.status(200).json(data);
}
