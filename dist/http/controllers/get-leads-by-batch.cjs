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

// src/http/controllers/get-leads-by-batch.ts
var get_leads_by_batch_exports = {};
__export(get_leads_by_batch_exports, {
  getLeadsByBatch: () => getLeadsByBatch
});
module.exports = __toCommonJS(get_leads_by_batch_exports);

// src/services/database/index.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();

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
    const where = {};
    if (email)
      where.email = email;
    if (phone)
      where.phone = phone;
    if (mobilephone)
      where.mobilephone = mobilephone;
    return await prisma.lead.findFirst({ where });
  }
  async update(id, data) {
    console.log({ id, data });
    await prisma.lead.update({
      where: { id },
      data
    });
  }
};

// src/use-cases/leads/get-leads-by-batch.ts
var GetLeadsByBatchUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute({ batch }) {
    const leads = await this.repository.getByBatch(batch);
    return leads || [];
  }
};

// src/http/controllers/get-leads-by-batch.ts
async function getLeadsByBatch(request, response, next) {
  try {
    const { batch } = request.params;
    const repository = new PrismaLeadsRepository();
    const leads = await new GetLeadsByBatchUseCase(repository).execute({ batch });
    const NEGATIVE_KEY_WORDS = [
      "freelancer",
      "aut\xF4nomo",
      "aut\xF4noma",
      "marketing",
      "digital",
      "ag\xEAncia",
      "tr\xE1fego",
      "performance",
      "propaganda",
      "nutricionista",
      "est\xE9tica",
      "beleza",
      "cabeleireiro",
      "cabeleireira",
      "sal\xE3o",
      "unhas",
      "maquiagem",
      "fot\xF3grafo",
      "fotografia",
      "v\xEDdeo maker",
      "v\xEDdeos",
      "psic\xF3logo",
      "psic\xF3loga",
      "sa\xFAde",
      "mental",
      "terapia",
      "dentista",
      "cl\xEDnica",
      "fisioterapia",
      "hinode",
      "mary kay",
      "semijoias",
      "joias",
      "bijuterias",
      "artesanato",
      "artes\xE3",
      "artes\xE3o",
      "blog",
      "blogger",
      "influencer",
      "influenciador",
      "mentoria",
      "mentor",
      "coach",
      "coaching",
      "artista",
      "pintura",
      "design gr\xE1fico",
      "designer",
      "beleza",
      "beauty",
      "est\xE9tica",
      "sobrancelhas",
      "cabeleireiro",
      "manicure",
      "espiritualidade",
      "terapia integrativa",
      "hol\xEDstica",
      "personal",
      "treinador",
      "academia",
      "influencer",
      "digital",
      "autoajuda",
      "espiritual",
      "autoconhecimento",
      "boutique",
      "mercearia",
      "consultora de imagem",
      "estilo",
      "blogueira",
      "youtuber",
      "criador de conte\xFAdo",
      "mkt",
      "design",
      "trafego",
      "psicologa",
      "fotografa",
      "assessoria",
      "sest senat",
      "sesi",
      "print",
      "designer",
      "social media",
      "marketing"
    ];
    return response.status(200).json({
      data: leads.filter((lead) => {
        if (!lead.phone && !lead.mobilephone)
          return false;
        const name = (lead.firstname + lead.lastname).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const hasNegativeKeyWord = NEGATIVE_KEY_WORDS.find((k) => name.includes(k));
        return !hasNegativeKeyWord;
      }),
      count: leads.length
    });
  } catch (e) {
    next(e);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getLeadsByBatch
});
