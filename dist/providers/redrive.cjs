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

// src/providers/redrive.ts
var redrive_exports = {};
__export(redrive_exports, {
  RedriveProvider: () => RedriveProvider
});
module.exports = __toCommonJS(redrive_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RedriveProvider
});
