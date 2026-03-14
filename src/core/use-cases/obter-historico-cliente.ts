import { EntidadeHistoricoCliente } from "@/core/entities/agendamento";
import { RepositorioAgendamento } from "@/core/repositories/repositorio-agendamento";

export class CasoDeUsoObterHistoricoCliente {
  constructor(private readonly repositorioAgendamento: RepositorioAgendamento) {}

  async executar(idSalao: string, idCliente: string): Promise<EntidadeHistoricoCliente | null> {
    return this.repositorioAgendamento.obterHistoricoCliente(idSalao, idCliente);
  }
}
