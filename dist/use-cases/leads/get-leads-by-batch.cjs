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

// src/use-cases/leads/get-leads-by-batch.ts
var get_leads_by_batch_exports = {};
__export(get_leads_by_batch_exports, {
  GetLeadsByBatchUseCase: () => GetLeadsByBatchUseCase
});
module.exports = __toCommonJS(get_leads_by_batch_exports);
var GetLeadsByBatchUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute({ batch }) {
    const leads = await this.repository.getByBatch(batch);
    return leads || [];
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GetLeadsByBatchUseCase
});
