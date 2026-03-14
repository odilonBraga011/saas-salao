import { EntidadeAgendamento } from "@/core/entities/agendamento";
import {
  FiltrosListagemAgendamentos,
  RepositorioAgendamento
} from "@/core/repositories/repositorio-agendamento";

export class CasoDeUsoListarAgendamentos {
  constructor(private readonly repositorioAgendamento: RepositorioAgendamento) {}

  async executar(filtros: FiltrosListagemAgendamentos): Promise<EntidadeAgendamento[]> {
    return this.repositorioAgendamento.listar(filtros);
  }
}
