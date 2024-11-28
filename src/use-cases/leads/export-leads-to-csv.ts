import { formatToPhone } from "@/lib/format-to-phone";
import { ILeadsRepository } from "@/repositories/leads-repository";
import { formatToWhatsappLink } from "@/lib/format-to-whatsapp-link";

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

type Props = {
    batch: string
    useNegativeKeyWords?: boolean
}

export class ExportLeadsToCSVUseCase {

    constructor(
        private repository: ILeadsRepository
    ) { }

    async execute({ batch, useNegativeKeyWords }: Props) {

        console.log('Exportando...')

        useNegativeKeyWords = true;

        const leads = await this.repository.getByBatch(batch);

        console.log(leads.length)

        const headers = ['ID', 'Post', 'Nome', 'Sobrenome', 'Instagram', 'Telefone', 'Link do Whatsapp', 'Email', 'Criado em'].join(',');

        const rows = leads
            .filter(lead => {

                if (!lead.phone && !lead.mobilephone) return false

                const name = (lead.firstname + lead.lastname).normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
                const hasNegativeKeyWord = useNegativeKeyWords ? NEGATIVE_KEY_WORDS.find(k => name.includes(k)) : false;
                if (hasNegativeKeyWord) {
                    return false
                }

                return true;
            })
            .map(lead => {

                const phone = lead.phone || lead.mobilephone;

                const json = {
                    id: lead.id || "--/--/--",
                    post: `instagram.com/p/${lead.arg}` || "--/--/--",
                    firstname: lead.firstname || "--/--/--",
                    lastname: lead.lastname || "--/--/--",
                    instagram: `instagram.com/${lead.instagram}` || "--/--/--",
                    phone: phone ? formatToPhone(phone as string) : "--/--/--",
                    whatsapp: phone ? formatToWhatsappLink(phone as string) : "--/--/--",
                    email: lead.email || "--/--/--",
                    createdAt: new Date(lead.createdAt).toLocaleDateString('pt-br')
                }
                return Object.values(json).join(',');
            })

        return {
            CSV: `${headers}\n${rows.join('\n')}`
        }

    }

}