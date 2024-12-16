"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/http/controllers/run-scrapper-queue.ts
var run_scrapper_queue_exports = {};
__export(run_scrapper_queue_exports, {
  runScrapperQueue: () => runScrapperQueue
});
module.exports = __toCommonJS(run_scrapper_queue_exports);

// src/providers/redrive.ts
var import_firestore2 = require("firebase/firestore");

// src/services/redrive/index.ts
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");
var import_process = require("process");
var config = {
  apiKey: import_process.env.FIREBASE_API_KEY,
  authDomain: import_process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: import_process.env.FIREBASE_DATABASE_URL,
  projectId: import_process.env.FIREBASE_PROJECT_ID,
  storageBucket: import_process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import_process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: import_process.env.FIREBASE_APP_ID,
  measurementId: import_process.env.FIREBASE_MEASUREMENT_ID
};
var app = (0, import_app.initializeApp)(config);
var firestore = (0, import_firestore.getFirestore)(app);

// src/providers/redrive.ts
var import_axios = __toESM(require("axios"), 1);

// src/services/database/index.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();

// src/providers/redrive.ts
var RedriveProvider = class {
  constructor() {
    this.token = null;
    this.headers = {
      "Accept": "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6",
      "Cache-Control": "no-cache",
      "Origin": "https://app.redrive.com.br",
      "Pragma": "no-cache",
      "Priority": "u=1, i",
      "Referer": "https://app.redrive.com.br/",
      "Sec-CH-UA": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
      "Sec-CH-UA-Mobile": "?0",
      "Sec-CH-UA-Platform": '"Linux"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
    };
    this.instance = import_axios.default.create({
      baseURL: "https://instagram.redrive.com.br",
      headers: this.headers
    });
  }
  async initialize() {
    if (this.token)
      return;
    const auth = await prisma.redriveAuth.findFirst();
    if (!auth) {
      const { token } = await this.login();
      this.token = token;
      await prisma.redriveAuth.create({ data: { token } });
    }
    if (auth)
      this.token = auth.token;
    this.instance = import_axios.default.create({
      baseURL: "https://instagram.redrive.com.br",
      headers: { ...this.headers, Authorization: this.token }
    });
  }
  async tryMultipleTimes(cb, options = { attempts: 1 }) {
    for (let attempt = 1; attempt <= options.attempts; attempt++) {
      try {
        return await cb();
      } catch (error) {
        if (attempt == options.attempts && error?.response?.data)
          throw error?.response?.data;
        if (attempt == options.attempts)
          throw error;
        if (error?.response?.status == 401) {
          const { token } = await this.login();
          this.token = token;
          this.instance = import_axios.default.create({
            baseURL: "https://instagram.redrive.com.br",
            headers: { ...this.headers, Authorization: this.token }
          });
        }
      }
      ;
    }
    ;
    throw new Error("Function failed without error details.");
  }
  async login() {
    const { data } = await import_axios.default.post(`https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyA7inINbcgTHYrKPb1mEpZ3LIb3dMAzI_k`, {
      "email": "diogo.alan@v4company.com",
      "password": "LWA644*yzY9auQH",
      "returnSecureToken": true
    });
    return { token: data.idToken };
  }
  async getTaskByArg(arg) {
    return await this.tryMultipleTimes(async () => {
      const ref = (0, import_firestore2.collection)(firestore, "instagram-queue");
      if (!ref)
        throw new Error("cannot find instagram-queue collection on firestore");
      const q = (0, import_firestore2.query)(
        ref,
        (0, import_firestore2.where)("arg", "==", arg),
        (0, import_firestore2.where)("owner", "==", process.env.REDRIVE_OWNER_ID)
      );
      const snapshot = await (0, import_firestore2.getDocs)(q);
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), doc: doc.id }));
      return data[0];
    }, { attempts: 2 });
  }
  async getPostDataById(post) {
    return await this.tryMultipleTimes(async () => {
      await this.initialize();
      const { data } = await this.instance.get(`/check-post-new/${post}`);
      return data?.result;
    }, { attempts: 2 });
  }
  async addPostToQueue({ arg, tags }) {
    const post = await this.getPostDataById(arg);
    if (!post)
      throw new Error(`cannot find ${arg} in redrive`);
    return await this.tryMultipleTimes(async () => {
      await this.initialize();
      const { data } = await this.instance.post("/insta-scrapper-post-likes", {
        "post": arg,
        "owner": process.env.REDRIVE_OWNER_ID,
        "tags": tags,
        "postData": {
          "id": post.id,
          "biography": post.biography,
          "profile_pic_url": post.profile_pic_url
        }
      });
      console.log(`\u2705 Post (${arg}) successfully add to redrive queue!`);
      return data;
    }, { attempts: 2 });
  }
  async runSearchAgain(doc) {
    return await this.tryMultipleTimes(async () => {
      const { data } = await this.instance.post(`/insta-restart`, {
        docId: doc
      });
      if (!data?.ack)
        throw new Error();
    }, { attempts: 2 });
  }
  async exportLeadsToCSV(doc) {
    return await this.tryMultipleTimes(async () => {
      const { data } = await import_axios.default.post(`https://misc.redrive.com.br/export-csv`, {
        userId: process.env.REDRIVE_OWNER_ID,
        fileType: "csv",
        doc
      });
      if (!data?.ack)
        throw new Error();
    }, { attempts: 2 });
  }
  async getLeadsByInstagram(instagram) {
    const ref = (0, import_firestore2.collection)(firestore, "crm-leads");
    if (!ref)
      throw new Error("cannot find leads collection on firestore");
    const q = (0, import_firestore2.query)(
      ref,
      (0, import_firestore2.where)("instagram", "==", instagram)
    );
    const snapshot = await (0, import_firestore2.getDocs)(q);
    const data = snapshot.docs.map((doc) => ({ ...doc.data(), doc: doc.id }));
    return data;
  }
  async getLeadsByArg(arg) {
    const ref = (0, import_firestore2.collection)(firestore, "crm-leads");
    if (!ref)
      throw new Error("cannot find leads collection on firestore");
    const q = (0, import_firestore2.query)(
      ref,
      (0, import_firestore2.where)("leadOwner", "==", process.env.REDRIVE_OWNER_ID),
      (0, import_firestore2.where)("tags", "array-contains", arg)
    );
    const snapshot = await (0, import_firestore2.getDocs)(q);
    const data = snapshot.docs.map((doc) => ({ ...doc.data(), doc: doc.id }));
    return data;
  }
  async getPendingOrScrapingInstagramTasks() {
    const ref = (0, import_firestore2.collection)(firestore, "instagram-queue");
    if (!ref)
      throw new Error("cannot find instagram-queue collection on firestore");
    const q = (0, import_firestore2.query)(
      ref,
      (0, import_firestore2.where)("status", "in", ["scraping", "pending"]),
      (0, import_firestore2.where)("owner", "==", process.env.REDRIVE_OWNER_ID)
    );
    const snapshot = await (0, import_firestore2.getDocs)(q);
    const data = snapshot.docs.map((doc) => doc.data());
    return data;
  }
};

// src/repositories/prisma/prisma-instagram-queue-tasks-repository.ts
var PrismaInstagramQueueTasksRepository = class {
  async create(data) {
    const tasks = await prisma.instagramScrappingTask.create({
      data: { ...data, isAssignedToSalesTeam: true }
    });
    return tasks;
  }
  async getByStatus(status) {
    const tasks = await prisma.instagramScrappingTask.findMany({
      where: typeof status == "string" ? { status } : { OR: status.map((status2) => ({ status: status2 })) },
      include: {
        logs: true
      }
    });
    return tasks;
  }
  async update(id, data) {
    await prisma.instagramScrappingTask.update({ where: { id }, data });
  }
  async updateByArg(arg, data) {
    await prisma.instagramScrappingTask.updateMany({ where: { arg }, data });
  }
  async getByArg(arg) {
    const task = await prisma.instagramScrappingTask.findFirst({ where: { arg } });
    return task;
  }
  async getByBatch(batch) {
    const tasks = await prisma.instagramScrappingTask.findMany({ where: { batch } });
    return tasks;
  }
  async getBatches({ isAssignedToSalesTeam } = { isAssignedToSalesTeam: false }) {
    const where2 = isAssignedToSalesTeam ? { isAssignedToSalesTeam: true } : {};
    const batches = await prisma.instagramScrappingTask.findMany({
      distinct: ["batch"],
      orderBy: { createdAt: "desc" },
      select: {
        batch: true
      },
      where: where2
    });
    return batches.map((b) => b.batch);
  }
  async getFailedTasksToVerify() {
    const tasks = await prisma.instagramScrappingTask.findMany({
      where: {
        status: "FAILED",
        logs: {
          none: {
            event: "FAILURE_CHECK"
          }
        },
        isAssignedToSalesTeam: true
      }
    });
    return tasks;
  }
};

// src/repositories/prisma/prisma-leads-repository.ts
var PrismaLeadsRepository = class {
  async getByBatch(batch) {
    const leads = await prisma.lead.findMany({
      where: { batch }
    });
    return leads;
  }
  async create(data) {
    await prisma.lead.create({
      data
    });
  }
  async getByContactData({ email, phone, mobilephone }) {
    const where2 = {};
    if (email)
      where2.email = email;
    if (phone)
      where2.phone = phone;
    if (mobilephone)
      where2.mobilephone = mobilephone;
    return await prisma.lead.findFirst({ where: where2 });
  }
  async update(id, data) {
    console.log({ id, data });
    await prisma.lead.update({
      where: { id },
      data
    });
  }
};

// src/use-cases/instagram/handle-instagram-scraping-tasks.ts
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

// src/use-cases/leads/create-lead.ts
var CreateLeadUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute({ batch, arg, lead }) {
    if (!lead.email && !lead.phone && !lead.mobilephone)
      return;
    const hasLeadOnDatabase = await this.repository.getByContactData({ email: lead.email, phone: lead.phone, mobilephone: lead.mobilephone });
    if (hasLeadOnDatabase)
      return;
    console.log(`Creating lead ${lead.email}`);
    await this.repository.create({
      batch,
      arg,
      email: lead.email || null,
      firstname: lead.firstname,
      lastname: lead.lastname || null,
      instagram: lead.instagram,
      mobilephone: lead.mobilephone || null,
      phone: lead.phone || null,
      tags: lead.tags
    });
  }
};

// src/http/controllers/run-scrapper-queue.ts
async function runScrapperQueue(request, response, next) {
  try {
    console.log("Received a request to run queue ------");
    const leadsRepository = new PrismaLeadsRepository();
    const tasksRepository = new PrismaInstagramQueueTasksRepository();
    const redriveProvider = new RedriveProvider();
    const data = await new HandleInstagramScrapingTasksUseCase(
      redriveProvider,
      tasksRepository,
      new CreateLeadUseCase(leadsRepository)
    ).execute();
    return response.status(200).json(data);
  } catch (e) {
    next(e);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  runScrapperQueue
});
