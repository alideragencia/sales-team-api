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

// src/use-cases/instagram/start-instagram-posts-retrieval-job-by-profile.ts
var start_instagram_posts_retrieval_job_by_profile_exports = {};
__export(start_instagram_posts_retrieval_job_by_profile_exports, {
  StartInstagramPostsRetrievalJobByProfileUseCase: () => StartInstagramPostsRetrievalJobByProfileUseCase
});
module.exports = __toCommonJS(start_instagram_posts_retrieval_job_by_profile_exports);
var FIVE_MINUTES_IN_MS = 60 * 1e3 * 5;
var StartInstagramPostsRetrievalJobByProfileUseCase = class {
  constructor(tasksRepository, apify) {
    this.tasksRepository = tasksRepository;
    this.apify = apify;
  }
  async execute({ profile, batch }) {
    const { id } = await this.apify.runInstagramProfilePostScraper(profile);
    await this.tasksRepository.create({
      data: { id, batch },
      key: "HANDLE_POSTS_BY_PROFILE_ON_APIFY",
      runAt: new Date(Date.now() + FIVE_MINUTES_IN_MS)
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StartInstagramPostsRetrievalJobByProfileUseCase
});
