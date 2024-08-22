



import { PrismaInstagramQueueTasksRepository } from '@/repositories/prisma/prisma-instagram-queue-tasks-repository';
import { AddInstagramTaskToQueue } from '@/use-cases/add-instagram-task-to-queue';
import { Request, Response } from 'express';

import { z } from "zod";

export async function scrapperPosts(request: Request, response: Response) {

    console.log('Received a list to add on queue ------');

    const schema = z.object({
        posts: z.array(z.string()),
        batch: z.string().min(1)
    })

    const { posts, batch } = schema.parse(request.body);

    const db = [];

    for (let post of posts) {

        const hasPostOnDatabase = await new PrismaInstagramQueueTasksRepository().getByArg(post);
        if (hasPostOnDatabase) continue;

        const data = await new AddInstagramTaskToQueue().execute({
            arg: post,
            type: 'LIKES',
            batch: batch,
            tags: []
        })

        db.push(data);
    }

    return response.status(200).json(db);
}
