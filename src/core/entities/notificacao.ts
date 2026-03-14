export type CanalNotificacao = "WHATSAPP" | "INSTAGRAM";

export interface EntidadeNotificacaoAgendamento {
  idAgendamento: string;
  canal: CanalNotificacao;
  destino: string;
  mensagem: string;
}

export interface ResultadoNotificacao {
  idAgendamento: string;
  canal: CanalNotificacao;
  destino: string;
  enviadoEm: Date;
}
