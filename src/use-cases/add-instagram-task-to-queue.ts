import { prisma } from "@/services/database"

type Props = {
    arg: string
    tags: string[]
    type: 'LIKES' | 'COMMENTS' | 'FOLLOWERS'
    batch: string
}

export class AddInstagramTaskToQueue {

    constructor() { }

    async execute({ arg, tags, type, batch }: Props) {
        const task = await prisma.instagramQueueTask.create({ data: { arg, tags, type, batch } })
        return task
    }

}