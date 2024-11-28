import { Lead } from "@prisma/client";
import { GetByContactDataProps, ILeadsRepository } from "../leads-repository";
import { prisma } from "@/services/database";

export class PrismaLeadsRepository implements ILeadsRepository {

    async getByBatch(batch: string): Promise<Lead[]> {
        const leads = await prisma.lead.findMany({
            where: { batch: batch }
        })
        return leads;
    }

    async create(data: Omit<Lead, "id" | "createdAt" | "updatedAt">): Promise<void> {
        await prisma.lead.create({
            data: data,
        })
    }

    async getByContactData({ email, phone, mobilephone }: GetByContactDataProps): Promise<Lead | null> {

        const where: GetByContactDataProps = {};

        if (email) where.email = email;
        if (phone) where.phone = phone;
        if (mobilephone) where.mobilephone = mobilephone;

        return await prisma.lead.findFirst({ where })
    }

    async update(id: string, data: Omit<Lead, "id" | "createdAt" | "updatedAt">): Promise<void> {

        console.log({ id, data })
        await prisma.lead.update({
            where: { id },
            data: data,
        })
    }
}