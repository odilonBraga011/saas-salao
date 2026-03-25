export type StatusAgendamento =
  | "AGENDADO"
  | "CONFIRMADO"
  | "CONCLUIDO"
  | "CANCELADO"
  | "FALTOU";

export interface EntidadeAgendamento {
  id: string;
  idSalao: string;
  idCliente: string;
  idProfissional: string;
  nomeCliente?: string;
  nomeProfissional?: string;
  inicioEm: Date;
  fimEm: Date;
  status: StatusAgendamento;
  observacao?: string;
  itens?: Array<{
    idServico: string;
    nomeServico?: string;
    quantidade: number;
    precoUnitarioCentavos?: number;
  }>;
}

export interface EntidadeHistoricoCliente {
  idCliente: string;
  nomeCliente: string;
  totalAtendimentos: number;
  ultimoAtendimentoEm?: Date;
  servicos: Array<{
    idServico: string;
    nomeServico: string;
    quantidade: number;
    valorTotalCentavos: number;
  }>;
}
