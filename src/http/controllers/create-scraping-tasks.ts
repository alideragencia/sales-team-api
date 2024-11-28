



import { env } from '@/config/env';
import { ApifyProvider } from '@/providers/apify';
import { PrismaInstagramQueueTasksRepository } from '@/repositories/prisma/prisma-instagram-queue-tasks-repository';
import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository';
import { CreateInstagramScrapingTaskUseCase } from '@/use-cases/instagram/create-instagram-scraping-task';
import { StartInstagramPostsRetrievalJobByProfileUseCase } from '@/use-cases/instagram/start-instagram-posts-retrieval-job-by-profile';
import { NextFunction, Request, Response } from 'express';

import { z } from "zod";

export async function createScrapingTasks(request: Request, response: Response, next: NextFunction) {
    try {

        const schema = z.object({
            posts: z.array(z.string()).optional(),
            profile: z.string().optional(),
            batch: z.string().min(1)
        }).refine(
            data => !!data.posts || !!data.profile,
            'Either posts or profile should be filled in.',
        );

        const { posts, profile, batch } = schema.parse(request.body);

        if (profile) {

            const s = new StartInstagramPostsRetrievalJobByProfileUseCase(
                new PrismaTasksRepository(),
                new ApifyProvider({ token: env.APIFY_TOKEN })
            )

            await s.execute({ profile, batch })

        }

        if (posts?.length) {

            const createInstagramScrapingTaskUseCase = new CreateInstagramScrapingTaskUseCase(new PrismaInstagramQueueTasksRepository())

            for (let post of posts) {

                await createInstagramScrapingTaskUseCase.execute({
                    arg: post,
                    type: 'LIKES_ON_POST',
                    batch: batch,
                    tags: []
                });

            }

        }

        return response.sendStatus(201);

    } catch (e) {
        next(e);
    }
}
