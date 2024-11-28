


import { PrismaLeadsRepository } from '@/repositories/prisma/prisma-leads-repository';
import { GetLeadsByBatchUseCase } from '@/use-cases/leads/get-leads-by-batch';
import { NextFunction, Request, Response } from 'express';

export async function getLeadsByBatch(request: Request, response: Response, next: NextFunction) {
    try {
        const { batch } = request.params;

        const repository = new PrismaLeadsRepository();
        const leads = await new GetLeadsByBatchUseCase(repository).execute({ batch });

        const NEGATIVE_KEY_WORDS = [
            "freelancer", "autônomo", "autônoma", "marketing", "digital",
            "agência", "tráfego", "performance", "propaganda", "nutricionista", "estética", "beleza",
            "cabeleireiro", "cabeleireira", "salão", "unhas", "maquiagem", "fotógrafo", "fotografia",
            "vídeo maker", "vídeos", "psicólogo", "psicóloga", "saúde", "mental", "terapia", "dentista",
            "clínica", "fisioterapia", "hinode", "mary kay", "semijoias", "joias", "bijuterias", "artesanato", "artesã", "artesão", "blog",
            "blogger", "influencer", "influenciador", "mentoria", "mentor", "coach", "coaching", "artista",
            "pintura", "design gráfico", "designer", "beleza",
            "beauty", "estética", "sobrancelhas", "cabeleireiro", "manicure", "espiritualidade", "terapia integrativa",
            "holística", "personal", "treinador", "academia", "influencer", "digital", "autoajuda",
            "espiritual", "autoconhecimento", "boutique", "mercearia", "consultora de imagem",
            "estilo", "blogueira", "youtuber", "criador de conteúdo", 'mkt', 'design', 'trafego', 'psicologa', 'fotografa', 'assessoria',
            "sest senat", "sesi", "print", "designer", "social media", "marketing"
        ];

        return response.status(200).json({
            data: leads.filter(lead => {
                if (!lead.phone && !lead.mobilephone) return false
                const name = (lead.firstname + lead.lastname).normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
                const hasNegativeKeyWord = NEGATIVE_KEY_WORDS.find(k => name.includes(k))
                return !hasNegativeKeyWord;
            }),
            count: leads.length
        });

    } catch (e) {
        next(e);
    }
}
