import { ILeadsRepository } from "@/repositories/leads-repository";

export class UpdateLeadByIdUseCase {

    constructor(
        private repository: ILeadsRepository,
    ) { }

    async execute(id: string, data: object): Promise<void> {
        await this.repository.update(id, data);
    }
}