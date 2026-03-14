export interface ResumoPainelGerencial {
  periodo: {
    inicioDe?: Date;
    inicioAte?: Date;
  };
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
