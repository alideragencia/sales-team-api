import { RedriveProvider } from "@/providers/redrive-provider";
import { IInstagramQueueTasksRepository } from "@/repositories/instagram-queue-tasks-repository";
import { prisma } from "@/services/database"
import { InstagramQueueAction } from "@/types/instagram-queue"

import axios from 'axios';

type Props = {
    arg: string
    tags: string[]
    type: 'LIKES' | 'COMMENTS' | 'FOLLOWERS'
    batch: string
}

export class AddInstagramTaskToRedriveQueue {

    constructor(
        private redrive: RedriveProvider,
        private tasks: IInstagramQueueTasksRepository
    ) { }

    async execute({ arg, tags, type, batch }: Props) {

        const post = await this.redrive.getPostDataById(arg);

        if (!post) throw new Error(`cannot find ${arg} in redrive`);

        console.log(`Post Caption =>`)
        console.log('ID' + post.id + '\n');
        console.log('Text' + post.caption.text + '\n');
        console.log('Picture' + post.caption.user.profile_pic_url + '\n');

        tags = [...tags, arg, batch];

        const data = await this.redrive.addPostToQueue({
            arg, tags, post: { "id": post.id, "biography": post.caption.text, "profile_pic_url": post.caption.user.profile_pic_url }
        })

        console.log('Succesfully add post on redrive =>')
        console.log(data);

        if (!data?.ack) {
            await this.tasks.updateByArg(arg, { status: 'FAILED', })
            throw new Error(`error adding task in redrive queue => ${JSON.stringify(data)}`)
        }

        await this.tasks.updateByArg(arg, { status: 'PENDING', })

    }

}