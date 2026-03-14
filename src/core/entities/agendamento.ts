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
  inicioEm: Date;
  fimEm: Date;
  status: StatusAgendamento;
  observacao?: string;
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
