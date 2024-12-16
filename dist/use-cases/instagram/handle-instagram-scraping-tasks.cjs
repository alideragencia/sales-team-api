"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/use-cases/instagram/handle-instagram-scraping-tasks.ts
var handle_instagram_scraping_tasks_exports = {};
__export(handle_instagram_scraping_tasks_exports, {
  HandleInstagramScrapingTasksUseCase: () => HandleInstagramScrapingTasksUseCase
});
module.exports = __toCommonJS(handle_instagram_scraping_tasks_exports);
var HandleInstagramScrapingTasksUseCase = class {
  constructor(redrive, tasks, createLeadUseCase) {
    this.redrive = redrive;
    this.tasks = tasks;
    this.createLeadUseCase = createLeadUseCase;
  }
  async execute() {
    const LOGS = {
      "ESPERANDO": 0,
      "EXECUTANDO": 0,
      "NOVAMENTE": 0,
      "FINALIZADAS": 0,
      "ADICIONADAS": 0
    };
    const tasks = (await this.tasks.getByStatus(["RUNNING", "PENDING"])).slice(0, 10);
    for (let task of tasks) {
      const t = await this.redrive.getTaskByArg(task.arg);
      console.log(`\u{1F5D2} Checking task ${task.arg}`);
      console.log(t);
      await new Promise((r) => setTimeout(r, 250));
      const finish = async () => {
        await this.tasks.update(task.id, {
          status: "FINISHED",
          leads: Number(t.totalLeads),
          finishedAt: /* @__PURE__ */ new Date(),
          //@ts-ignore
          logs: {
            create: {
              event: "FINISHED_SEARCH",
              leads: Number(t.totalLeads)
            }
          }
        });
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
          });
        }));
        LOGS["FINALIZADAS"]++;
      };
      const repeat = async () => {
        await this.tasks.update(task.id, {
          leads: Number(t.totalLeads),
          //@ts-ignore
          logs: {
            create: {
              event: "SEARCH_HALTED",
              leads: Number(t.totalLeads)
            }
          }
        });
        if (t?.doc) {
          await this.redrive.runSearchAgain(t.doc);
          LOGS["NOVAMENTE"]++;
          return;
        }
      };
      const error = async () => {
        await this.tasks.update(task.id, { status: "FAILED" });
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
          });
        }));
      };
      if (t.status == "pending" || t.status == "pending-new") {
        LOGS["ESPERANDO"]++;
        continue;
      }
      if (t.status == "scraping" || t.status == "paused") {
        LOGS["EXECUTANDO"]++;
        if (task.status == "RUNNING")
          continue;
        await this.tasks.update(task.id, { status: "RUNNING" });
        continue;
      }
      if (t.status == "stopped_by_system") {
        let logs = task.logs;
        logs = logs?.length ? logs.filter((l) => l.event == "STOPPED_BY_SYSTEM") : [];
        if (!logs.length) {
          await this.tasks.update(task.id, {
            //@ts-ignore
            logs: {
              create: {
                event: "STOPPED_BY_SYSTEM",
                leads: Number(t.totalLeads)
              }
            }
          });
          continue;
        }
        await error();
        continue;
      }
      if (t.status == "complete" || t.status == "stopped_by_user") {
        const hasGoodPercentageOfLeads = t.totalLeads / t.followersCount > 0.2;
        if (hasGoodPercentageOfLeads) {
          await finish();
          continue;
        }
        let logs = task.logs;
        logs = logs?.length ? logs.filter((l) => l.event == "SEARCH_HALTED") : [];
        if (logs.length <= 1) {
          await repeat();
          continue;
        }
        const penultimateTotalLeads = logs.at(-2)?.data?.leads || 0;
        const lastTotalLeads = (logs.at(-1)?.data?.leads || 0) - penultimateTotalLeads;
        const hasGoodLeadColletionRate = lastTotalLeads / penultimateTotalLeads > 0.35;
        if (hasGoodLeadColletionRate) {
          await repeat();
          continue;
        }
        await finish();
      }
    }
    const MAX_ITENS_ON_REDRIVE_QUEUE = 3;
    const remaining = await this.tasks.getByStatus(["RUNNING", "PENDING"]);
    if (remaining.length >= MAX_ITENS_ON_REDRIVE_QUEUE)
      return LOGS;
    const distributed = await (async () => {
      const tasks2 = await this.tasks.getByStatus("WAITING");
      const max = MAX_ITENS_ON_REDRIVE_QUEUE - remaining.length;
      return tasks2.slice(0, max);
    })();
    for (let task of distributed) {
      try {
        LOGS["ADICIONADAS"]++;
        const data = await this.redrive.addPostToQueue({ ...task, tags: [task.batch, task.arg] });
        console.log(`Adicionou`);
        console.log(data);
        if (!data?.ack) {
          await this.tasks.updateByArg(task.arg, { status: "FAILED" });
          throw new Error(`error adding task in redrive queue => ${JSON.stringify(data)}`);
        }
      } catch (e) {
      }
    }
    return LOGS;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HandleInstagramScrapingTasksUseCase
});
