

export function formatToWhatsappLink(phone: string) {
    return `https://wa.me/${(phone).replace(/\D/g, '')}`
}