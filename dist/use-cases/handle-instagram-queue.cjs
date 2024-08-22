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

// src/use-cases/handle-instagram-queue.ts
var handle_instagram_queue_exports = {};
__export(handle_instagram_queue_exports, {
  HandleInstagramQueueUseCase: () => HandleInstagramQueueUseCase
});
module.exports = __toCommonJS(handle_instagram_queue_exports);

// src/use-cases/add-instagram-task-to-redrive-queue.ts
var AddInstagramTaskToRedriveQueue = class {
  constructor(redrive, tasks) {
    this.redrive = redrive;
    this.tasks = tasks;
  }
  async execute({ arg, tags, type, batch }) {
    const post = await this.redrive.getPostDataById(arg);
    if (!post)
      throw new Error(`cannot find ${arg} in redrive`);
    console.log(`Post Caption =>`);
    console.log("ID" + post.id + "\n");
    console.log("Text" + post.caption.text + "\n");
    console.log("Picture" + post.caption.user.profile_pic_url + "\n");
    tags = [...tags, arg, batch];
    const data = await this.redrive.addPostToQueue({
      arg,
      tags,
      post: { "id": post.id, "biography": post.caption.text, "profile_pic_url": post.caption.user.profile_pic_url }
    });
    console.log("Succesfully add post on redrive =>");
    console.log(data);
    if (!data?.ack) {
      await this.tasks.updateByArg(arg, { status: "FAILED" });
      throw new Error(`error adding task in redrive queue => ${JSON.stringify(data)}`);
    }
    await this.tasks.updateByArg(arg, { status: "PENDING" });
  }
};

// src/use-cases/handle-instagram-queue.ts
var HandleInstagramQueueUseCase = class {
  constructor(redrive, tasks) {
    this.redrive = redrive;
    this.tasks = tasks;
  }
  async execute() {
    const LOGS = {
      "ESPERANDO": 0,
      "EXECUTANDO": 0,
      "NOVAMENTE": 0,
      "FINALIZADAS": 0,
      "ADICIONADAS": 0
    };
    const tasks = await this.tasks.getByStatus(["RUNNING", "PENDING"]);
    console.log(`Tasks Pending or Running => ${tasks.length}`);
    for (let task of tasks) {
      const t = await this.redrive.getTaskByArg(task.arg);
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
      if (t.status == "pending") {
        LOGS["ESPERANDO"]++;
        continue;
      }
      if (t.status == "scraping")
        LOGS["EXECUTANDO"]++;
      if (t.status == "scraping" && task.status == "RUNNING")
        continue;
      if (t.status == "scraping" && task.status != "RUNNING") {
        await this.tasks.update(task.id, { status: "RUNNING" });
        continue;
      }
      ;
      if (t.status == "stopped_by_system") {
        await this.tasks.update(task.id, { status: "FAILED" });
        continue;
      }
      if (t.status == "complete") {
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
    const MAX_ITENS_ON_REDRIVE_QUEUE = 2;
    const remaining = await this.tasks.getByStatus(["RUNNING", "PENDING"]);
    if (remaining.length >= MAX_ITENS_ON_REDRIVE_QUEUE)
      return LOGS;
    const tasksToAdd = await this.tasks.getByStatus("WAITING");
    const addInstagramTaskToRedriveQueueUseCase = new AddInstagramTaskToRedriveQueue(this.redrive, this.tasks);
    for (let task of tasksToAdd.slice(0, MAX_ITENS_ON_REDRIVE_QUEUE - remaining.length)) {
      await addInstagramTaskToRedriveQueueUseCase.execute({ ...task });
      LOGS["ADICIONADAS"]++;
    }
    return LOGS;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HandleInstagramQueueUseCase
});
