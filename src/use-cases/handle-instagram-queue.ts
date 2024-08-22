import { AddInstagramTaskToRedriveQueue } from "./add-instagram-task-to-redrive-queue";
import { RedriveProvider } from "@/providers/redrive-provider";
import { IInstagramQueueTasksRepository } from "@/repositories/instagram-queue-tasks-repository";
import { prisma } from "@/services/database";
import { InstagramQueueTaskLogEvent } from "@prisma/client";



export class HandleInstagramQueueUseCase {

    constructor(
        private redrive: RedriveProvider,
        private tasks: IInstagramQueueTasksRepository
    ) { }

    async execute() {

        const LOGS = {
            "ESPERANDO": 0,
            "EXECUTANDO": 0,
            "NOVAMENTE": 0,
            "FINALIZADAS": 0,
            "ADICIONADAS": 0
        };

        const tasks = await this.tasks.getByStatus(['RUNNING', 'PENDING']);

        console.log(`Tasks Pending or Running => ${tasks.length}`)

        for (let task of tasks) {

            const t = await this.redrive.getTaskByArg(task.arg);

            const finish = async () => {
                await this.tasks.update(task.id, {
                    status: 'FINISHED',
                    leads: Number(t.totalLeads),
                    finishedAt: new Date(),
                    //@ts-ignore
                    logs: {
                        create: {
                            event: 'FINISHED_SEARCH',
                            leads: Number(t.totalLeads)
                        }
                    }
                });
                LOGS["FINALIZADAS"]++;
            }

            const repeat = async () => {
                await this.tasks.update(task.id, {
                    leads: Number(t.totalLeads),
                    //@ts-ignore
                    logs: {
                        create: {
                            event: 'SEARCH_HALTED',
                            leads: Number(t.totalLeads)
                        }
                    }
                });

                if (t?.doc) {
                    await this.redrive.runSearchAgain(t.doc)
                    LOGS["NOVAMENTE"]++;
                    return
                }

            }

            if (t.status == 'pending') {
                LOGS['ESPERANDO']++
                continue
            }

            if (t.status == 'scraping') LOGS['EXECUTANDO']++;

            if (t.status == 'scraping' && task.status == 'RUNNING') continue;
            if ((t.status == 'scraping') && task.status != 'RUNNING') {
                await this.tasks.update(task.id, { status: 'RUNNING' });
                continue;
            };

            if (t.status == 'stopped_by_system') {
                await this.tasks.update(task.id, { status: 'FAILED' });
                continue;
            }

            if (t.status == 'complete') {

                // 20% de Coleta de Leads
                const hasGoodPercentageOfLeads = (t.totalLeads / t.followersCount) > 0.2;

                if (hasGoodPercentageOfLeads) {
                    await finish();
                    continue;
                }

                //@ts-ignore
                let logs = task.logs as { event: InstagramQueueTaskLogEvent, data: { leads: number } }[];
                logs = logs?.length ? logs.filter(l => l.event == "SEARCH_HALTED") : [];

                if (logs.length <= 1) {
                    await repeat();
                    continue;
                }

                const penultimateTotalLeads = logs.at(-2)?.data?.leads || 0
                const lastTotalLeads = (logs.at(-1)?.data?.leads || 0) - penultimateTotalLeads;

                const hasGoodLeadColletionRate = (lastTotalLeads / penultimateTotalLeads) > 0.35;

                if (hasGoodLeadColletionRate) {
                    await repeat();
                    continue;
                }

                await finish();

            }

        }

        const MAX_ITENS_ON_REDRIVE_QUEUE = 2;

        const remaining = await this.tasks.getByStatus(['RUNNING', 'PENDING']);
        if (remaining.length >= MAX_ITENS_ON_REDRIVE_QUEUE) return LOGS;

        const tasksToAdd = await this.tasks.getByStatus('WAITING');

        const addInstagramTaskToRedriveQueueUseCase = new AddInstagramTaskToRedriveQueue(this.redrive, this.tasks);

        for (let task of tasksToAdd.slice(0, MAX_ITENS_ON_REDRIVE_QUEUE - remaining.length)) {
            await addInstagramTaskToRedriveQueueUseCase.execute({ ...task })
            LOGS['ADICIONADAS']++;
        }

        return LOGS;
    }

}