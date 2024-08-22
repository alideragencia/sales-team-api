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

// src/use-cases/save-redrive-leads.ts
var save_redrive_leads_exports = {};
__export(save_redrive_leads_exports, {
  SaveRedriveLeadsUseCase: () => SaveRedriveLeadsUseCase
});
module.exports = __toCommonJS(save_redrive_leads_exports);
var SaveRedriveLeadsUseCase = class {
  constructor(repository, redrive) {
    this.repository = repository;
    this.redrive = redrive;
  }
  async execute({ batch, arg }) {
    const leads = await this.redrive.getLeadsByArg(arg);
    if (!leads.length)
      throw new Error("cannot found leads to save");
    leads.forEach(async (lead) => {
      if (!lead.email && !lead.phone && !lead.mobilephone)
        return;
      const hasLeadOnDatabase = await this.repository.getByContactData({ email: lead.email, phone: lead.phone, mobilephone: lead.mobilephone });
      if (hasLeadOnDatabase)
        return;
      await this.repository.create({
        batch,
        email: lead.email || null,
        firstname: lead.firstname,
        lastname: lead.lastname || null,
        instagram: lead.instagram,
        mobilephone: lead.mobilephone || null,
        phone: lead.phone || null,
        tags: lead.tags
      });
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SaveRedriveLeadsUseCase
});
