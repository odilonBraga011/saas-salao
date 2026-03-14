import { ResumoPainelGerencial } from "@/core/entities/painel-gerencial";
import {
  FiltrosPainelGerencial,
  RepositorioAgendamento
} from "@/core/repositories/repositorio-agendamento";

export class CasoDeUsoObterResumoPainelGerencial {
  constructor(private readonly repositorioAgendamento: RepositorioAgendamento) {}

  async executar(filtros: FiltrosPainelGerencial): Promise<ResumoPainelGerencial> {
    return this.repositorioAgendamento.obterResumoPainelGerencial(filtros);
  }
}
