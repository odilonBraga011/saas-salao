import {
  CanalNotificacao,
  EntidadeNotificacaoAgendamento,
  ResultadoNotificacao
} from "@/core/entities/notificacao";

export interface RepositorioNotificacao {
  enviar(dados: EntidadeNotificacaoAgendamento): Promise<ResultadoNotificacao>;
  possuiCanalAtivo(idSalao: string, canal: CanalNotificacao): Promise<boolean>;
}
