import {
  EntidadeNotificacaoAgendamento,
  ResultadoNotificacao
} from "@/core/entities/notificacao";
import { RepositorioNotificacao } from "@/core/repositories/repositorio-notificacao";
import { prisma } from "@/infrastructure/db/prisma-client";

export class RepositorioPrismaNotificacao implements RepositorioNotificacao {
  async enviar(dados: EntidadeNotificacaoAgendamento): Promise<ResultadoNotificacao> {
    const registro = await prisma.notificationLog.create({
      data: {
        appointmentId: dados.idAgendamento,
        channel: dados.canal,
        destination: dados.destino,
        payload: {
          mensagem: dados.mensagem
        }
      }
    });

    return {
      idAgendamento: registro.appointmentId,
      canal: registro.channel as "WHATSAPP" | "INSTAGRAM",
      destino: registro.destination,
      enviadoEm: registro.sentAt
    };
  }

  async possuiCanalAtivo(idSalao: string, canal: "WHATSAPP" | "INSTAGRAM"): Promise<boolean> {
    const config = await prisma.socialChannelConfig.findFirst({
      where: {
        tenantId: idSalao,
        channel: canal,
        isActive: true
      },
      select: { id: true }
    });

    return Boolean(config);
  }
}
