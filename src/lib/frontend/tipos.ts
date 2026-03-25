export interface SessaoUsuario {
  id: string;
  idSalao: string;
  nomeCompleto: string;
  email: string;
  papel: string;
}

export interface Sessao {
  token: string;
  usuario: SessaoUsuario;
}

export interface ResumoPainel {
  totais: {
    agendamentos: number;
    concluidos: number;
    cancelados: number;
    faltas: number;
    faturamentoCentavos: number;
  };
  taxaComparecimentoPercentual: number;
  profissionaisMaisAtivos: Array<{
    idProfissional: string;
    nomeProfissional: string;
    totalAtendimentos: number;
  }>;
  servicosMaisVendidos: Array<{
    idServico: string;
    nomeServico: string;
    quantidade: number;
    faturamentoCentavos: number;
  }>;
}

export interface Cliente {
  id: string;
  nomeCompleto: string;
  telefone: string;
  email?: string | null;
  dataNascimento?: string | null;
}

export interface Profissional {
  id: string;
  nomeCompleto: string;
  especialidade?: string | null;
  comissaoPercentual?: number | null;
  ativo?: boolean;
}

export interface Servico {
  id: string;
  nome: string;
  duracaoMin: number;
  precoBaseCentavos: number;
  descricao?: string | null;
  ativo?: boolean;
}

export interface UsuarioInterno {
  id: string;
  nomeCompleto: string;
  email: string;
  papel: string;
  status: string;
}

export type StatusAgendamento =
  | "AGENDADO"
  | "CONFIRMADO"
  | "CONCLUIDO"
  | "CANCELADO"
  | "FALTOU";

export interface Agendamento {
  id: string;
  idSalao: string;
  idCliente: string;
  idProfissional: string;
  nomeCliente?: string;
  nomeProfissional?: string;
  inicioEm: string;
  fimEm: string;
  status: StatusAgendamento;
  observacao?: string | null;
  itens?: Array<{
    idServico: string;
    nomeServico?: string;
    quantidade: number;
    precoUnitarioCentavos?: number;
  }>;
}

export interface HistoricoCliente {
  idCliente: string;
  nomeCliente: string;
  totalAtendimentos: number;
  ultimoAtendimentoEm?: string;
  servicos: Array<{
    idServico: string;
    nomeServico: string;
    quantidade: number;
    valorTotalCentavos: number;
  }>;
}
