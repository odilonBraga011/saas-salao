import { RepositorioAgendamento } from "@/core/repositories/repositorio-agendamento";
import { RepositorioNotificacao } from "@/core/repositories/repositorio-notificacao";
import {
  CanalNotificacao,
  EntidadeNotificacaoAgendamento,
  ResultadoNotificacao
} from "@/core/entities/notificacao";

interface EntradaEnviarNotificacao {
  idSalao: string;
  idAgendamento: string;
  canal: CanalNotificacao;
  destino: string;
  mensagem?: string;
}

export class CasoDeUsoEnviarNotificacaoAgendamento {
  constructor(
    private readonly repositorioAgendamento: RepositorioAgendamento,
    private readonly repositorioNotificacao: RepositorioNotificacao
  ) {}

  async executar(entrada: EntradaEnviarNotificacao): Promise<ResultadoNotificacao> {
    const possuiCanal = await this.repositorioNotificacao.possuiCanalAtivo(entrada.idSalao, entrada.canal);

    if (!possuiCanal) {
      throw new Error("Canal de notificação não está configurado para este salão.");
    }

    const agendamentos = await this.repositorioAgendamento.listar({
      idSalao: entrada.idSalao
    });

    const agendamento = agendamentos.find((item) => item.id === entrada.idAgendamento);

    if (!agendamento) {
      throw new Error("Agendamento não encontrado para o salão informado.");
    }

    const mensagemPadrao = `Lembrete do seu atendimento em ${agendamento.inicioEm.toISOString()}.`;

    const payload: EntidadeNotificacaoAgendamento = {
      idAgendamento: entrada.idAgendamento,
      canal: entrada.canal,
      destino: entrada.destino,
      mensagem: entrada.mensagem ?? mensagemPadrao
    };

    return this.repositorioNotificacao.enviar(payload);
  }
}
