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

// src/use-cases/instagram/create-instagram-scraping-task.ts
var create_instagram_scraping_task_exports = {};
__export(create_instagram_scraping_task_exports, {
  CreateInstagramScrapingTaskUseCase: () => CreateInstagramScrapingTaskUseCase
});
module.exports = __toCommonJS(create_instagram_scraping_task_exports);
var CreateInstagramScrapingTaskUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute({ arg, tags, type, batch, isAssignedToSalesTeam }) {
    if (type == "LIKES_ON_POST") {
      const hasPostOnDatabase = await this.repository.getByArg(arg);
      if (hasPostOnDatabase)
        throw new Error("duplicated instagram scraping task");
      const data = await this.repository.create({
        arg,
        type: "LIKES",
        batch,
        tags: [],
        isAssignedToSalesTeam: isAssignedToSalesTeam == void 0 || true
      });
      return data;
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CreateInstagramScrapingTaskUseCase
});
