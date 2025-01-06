import { RedriveProvider } from "@/providers/redrive";
import { IInstagramQueueTasksRepository } from "@/repositories/instagram-queue-tasks-repository";
import { CreateLeadUseCase } from "../leads/create-lead";

export class HandleInstagramScrapingTasksUseCase {

    constructor(
        private redrive: RedriveProvider,
        private tasks: IInstagramQueueTasksRepository,
        private createLeadUseCase: CreateLeadUseCase,
    ) { }

    async execute() {

        const LOGS = {
            "ESPERANDO": 0,
            "EXECUTANDO": 0,
            "NOVAMENTE": 0,
            "FINALIZADAS": 0,
            "ADICIONADAS": 0
        };

        const tasks = (await this.tasks.getByStatus(['RUNNING', 'PENDING'])).slice(0, 10);

        for (let task of tasks) {

            const t = await this.redrive.getTaskByArg(task.arg);

            console.log(`🗒 Checking task ${task.arg}`)
            console.log(t);


            await new Promise(r => setTimeout(r, 250));

            const leads = await this.redrive.getLeadsByArg(task.arg);

            await Promise.all(leads.map(async (lead) => {

                await this.createLeadUseCase.execute({
                    batch: task.batch,
                    arg: task.arg,
                    lead: {
                        email: lead.email,
                        firstname: lead.firstname,
                        lastname: lead.lastname,
                        instagram: lead.instagram,
                        mobilephone: lead.mobilephone,
                        phone: lead.phone,
                        tags: lead.tags
                    }
                })

            }))

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

            const error = async () => {

                await this.tasks.update(task.id, { status: 'FAILED' });

                const leads = await this.redrive.getLeadsByArg(task.arg);

                await Promise.all(leads.map(async (lead) => {

                    await this.createLeadUseCase.execute({
                        batch: task.batch,
                        arg: task.arg,
                        lead: {
                            email: lead.email,
                            firstname: lead.firstname,
                            lastname: lead.lastname,
                            instagram: lead.instagram,
                            mobilephone: lead.mobilephone,
                            phone: lead.phone,
                            tags: lead.tags
                        }
                    })

                }))


            }

            if (t.status == 'pending' || t.status == 'pending-new') {
                await this.tasks.updateByArg(task.arg, { status: "PENDING" });
                LOGS['ESPERANDO']++
                continue
            }

            if (t.status == 'scraping') {
                await this.tasks.update(task.id, { status: 'RUNNING' });
                LOGS['EXECUTANDO']++;
                continue;
            }

            if (t.status == 'stopped_by_system' || t.status == 'paused') {

                //@ts-ignore
                let logs = task.logs as { event: InstagramQueueTaskLogEvent, data: { leads: number } }[];
                logs = logs?.length ? logs.filter(l => l.event == "STOPPED_BY_SYSTEM") : [];

                if (!logs.length) {
                    await this.tasks.update(task.id, {
                        //@ts-ignore
                        logs: {
                            create: {
                                event: 'STOPPED_BY_SYSTEM',
                                leads: Number(t.totalLeads)
                            }
                        }
                    });
                    continue;
                }

                await error();
                continue;
            }

            if (t.status == 'complete' || t.status == 'stopped_by_user') {

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

        const MAX_ITENS_ON_REDRIVE_QUEUE = 3;

        const remaining = await this.tasks.getByStatus(['RUNNING', 'PENDING']);
        if (remaining.length >= MAX_ITENS_ON_REDRIVE_QUEUE) return LOGS;

        const distributed = await (async () => {

            const tasks = await this.tasks.getByStatus('WAITING');
            const max = MAX_ITENS_ON_REDRIVE_QUEUE - remaining.length;

            return tasks.slice(0, max)

        })();

        console.log(distributed)


        for (let task of distributed) {
            try {

                LOGS['ADICIONADAS']++;

                const data = await this.redrive.addPostToQueue({ ...task, tags: [task.batch, task.arg] })

                console.log(`Adicionou`)
                console.log(data)

                if (!data?.ack) {


                    console.log(await this.redrive.getLeadsByArg(task.arg))

                    await this.tasks.updateByArg(task.arg, { status: 'FAILED', })
                    throw new Error(`error adding task in redrive queue => ${JSON.stringify(data)}`)
                }

            } catch (e) {
                console.log(`❌ Error`)


                if (e?.response?.data) {
                    //@ts-ignore
                    console.log(e.response.data)
                } else if (e?.response) {
                    //@ts-ignore
                    console.log(e?.response)
                } else {
                    console.log(e)
                }
            }
        }

        return LOGS;
    }

}