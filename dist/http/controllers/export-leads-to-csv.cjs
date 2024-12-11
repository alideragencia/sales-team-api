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

// src/http/controllers/export-leads-to-csv.ts
var export_leads_to_csv_exports = {};
__export(export_leads_to_csv_exports, {
  exportLeadsToCSV: () => exportLeadsToCSV
});
module.exports = __toCommonJS(export_leads_to_csv_exports);

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

// src/lib/format-to-phone.ts
var formatToPhone = (v) => {
  v = v.replace(/\D/g, "");
  if (v.length == 13 && v.slice(0, 2) == "55")
    v = v.slice(2);
  if (v.length <= 10) {
    v = v.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  } else if (v.length === 11) {
    v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, "($1) $2 $3-$4");
  } else if (v.length === 13) {
    v = v.replace(/^(\d{2})(\d{2})(\d{1})(\d{4})(\d{4})$/, "$1 ($2) $3 $4-$5");
  } else {
    v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})(\d{0,4})$/, "($1) $2 $3-$4$5");
  }
  return v;
};

// src/lib/format-to-whatsapp-link.ts
function formatToWhatsappLink(phone) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

// src/use-cases/leads/export-leads-to-csv.ts
var NEGATIVE_KEY_WORDS = [
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
var ExportLeadsToCSVUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute({ batch, useNegativeKeyWords }) {
    console.log("Exportando...");
    useNegativeKeyWords = true;
    const leads = await this.repository.getByBatch(batch);
    console.log(leads.length);
    const headers = ["ID", "Post", "Nome", "Sobrenome", "Instagram", "Telefone", "Link do Whatsapp", "Email", "Criado em"].join(",");
    const rows = leads.filter((lead) => {
      if (!lead.phone && !lead.mobilephone)
        return false;
      const name = (lead.firstname + lead.lastname).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const hasNegativeKeyWord = useNegativeKeyWords ? NEGATIVE_KEY_WORDS.find((k) => name.includes(k)) : false;
      if (hasNegativeKeyWord) {
        return false;
      }
      return true;
    }).map((lead) => {
      const phone = lead.phone || lead.mobilephone;
      const json = {
        id: lead.id || "--/--/--",
        post: `instagram.com/p/${lead.arg}` || "--/--/--",
        firstname: lead.firstname || "--/--/--",
        lastname: lead.lastname || "--/--/--",
        instagram: `instagram.com/${lead.instagram}` || "--/--/--",
        phone: phone ? formatToPhone(phone) : "--/--/--",
        whatsapp: phone ? formatToWhatsappLink(phone) : "--/--/--",
        email: lead.email || "--/--/--",
        createdAt: new Date(lead.createdAt).toLocaleDateString("pt-br")
      };
      return Object.values(json).join(",");
    });
    return {
      CSV: `${headers}
${rows.join("\n")}`
    };
  }
};

// src/http/controllers/export-leads-to-csv.ts
async function exportLeadsToCSV(request, response, next) {
  try {
    const { batch } = request.query;
    const exportLeadsToCSVUseCase = new ExportLeadsToCSVUseCase(new PrismaLeadsRepository());
    const { CSV } = await exportLeadsToCSVUseCase.execute({ batch });
    response.header("Content-Type", "text/csv");
    response.attachment(`${batch}.csv`);
    return response.send(CSV);
  } catch (e) {
    console.log(e);
    next(e);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  exportLeadsToCSV
});
