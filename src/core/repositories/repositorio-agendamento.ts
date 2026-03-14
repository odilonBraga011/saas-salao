import { EntidadeAgendamento, EntidadeHistoricoCliente, StatusAgendamento } from "@/core/entities/agendamento";
import { ResumoPainelGerencial } from "@/core/entities/painel-gerencial";

export interface FiltrosListagemAgendamentos {
  idSalao: string;
  idProfissional?: string;
  idCliente?: string;
  status?: StatusAgendamento;
  inicioDe?: Date;
  inicioAte?: Date;
}

export interface FiltrosPainelGerencial {
  idSalao: string;
  inicioDe?: Date;
  inicioAte?: Date;
}

export interface RepositorioAgendamento {
  criar(dados: Omit<EntidadeAgendamento, "id">): Promise<EntidadeAgendamento>;
  listar(filtros: FiltrosListagemAgendamentos): Promise<EntidadeAgendamento[]>;
  existeConflitoDeHorario(params: {
    idSalao: string;
    idProfissional: string;
    inicioEm: Date;
    fimEm: Date;
  }): Promise<boolean>;
  obterHistoricoCliente(idSalao: string, idCliente: string): Promise<EntidadeHistoricoCliente | null>;
  obterResumoPainelGerencial(filtros: FiltrosPainelGerencial): Promise<ResumoPainelGerencial>;
}
