import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/infrastructure/db/prisma-client";
import { atualizarAgendamentoSchema } from "@/shared/validacoes/agendamento";

const mapaStatusParaPrisma = {
  AGENDADO: "SCHEDULED",
  CONFIRMADO: "CONFIRMED",
  CONCLUIDO: "COMPLETED",
  CANCELADO: "CANCELED",
  FALTOU: "NO_SHOW"
} as const;

interface ContextoRota {
  params: Promise<{
    idAgendamento: string;
  }>;
}

export async function PATCH(request: NextRequest, contexto: ContextoRota) {
  const { idAgendamento } = await contexto.params;
  const validacao = atualizarAgendamentoSchema.safeParse(await request.json());

  if (!validacao.success) {
    return NextResponse.json(
      { erro: "Dados inválidos para atualização.", detalhes: validacao.error.flatten() },
      { status: 400 }
    );
  }

  const agendamentoAtual = await prisma.appointment.findFirst({
    where: {
      id: idAgendamento,
      tenantId: validacao.data.idSalao
    }
  });

  if (!agendamentoAtual) {
    return NextResponse.json({ erro: "Agendamento não encontrado." }, { status: 404 });
  }

  try {
    const agendamento = await prisma.$transaction(async (trx) => {
      let itensResolvidos:
        | Array<{ serviceId: string; quantity: number; unitPriceCents: number }>
        | undefined;

      if (validacao.data.itens) {
        const idsServicos = [...new Set(validacao.data.itens.map((item) => item.idServico))];
        const servicos = await trx.service.findMany({
          where: {
            tenantId: validacao.data.idSalao,
            id: { in: idsServicos }
          },
          select: {
            id: true,
            basePriceCents: true
          }
        });

        if (servicos.length !== idsServicos.length) {
          throw new Error("Um ou mais serviços informados não pertencem ao salão.");
        }

        const mapaServicos = new Map(servicos.map((servico) => [servico.id, servico]));

        itensResolvidos = validacao.data.itens.map((item) => {
          const servico = mapaServicos.get(item.idServico);

          if (!servico) {
            throw new Error("Serviço informado não encontrado.");
          }

          return {
            serviceId: item.idServico,
            quantity: item.quantidade,
            unitPriceCents: item.precoUnitarioCentavos ?? servico.basePriceCents
          };
        });
      }

      return trx.appointment.update({
        where: { id: idAgendamento },
        data: {
          status: validacao.data.status ? mapaStatusParaPrisma[validacao.data.status] : undefined,
          note: validacao.data.observacao,
          items:
            itensResolvidos !== undefined
              ? {
                  deleteMany: {},
                  create: itensResolvidos
                }
              : undefined
        },
        include: {
          client: {
            select: { fullName: true }
          },
          professional: {
            select: { fullName: true }
          },
          items: {
            include: {
              service: {
                select: { id: true, name: true }
              }
            }
          }
        }
      });
    });

    return NextResponse.json({
      dados: {
        id: agendamento.id,
        idSalao: agendamento.tenantId,
        idCliente: agendamento.clientId,
        idProfissional: agendamento.professionalId,
        nomeCliente: agendamento.client.fullName,
        nomeProfissional: agendamento.professional.fullName,
        inicioEm: agendamento.startsAt,
        fimEm: agendamento.endsAt,
        observacao: agendamento.note,
        status:
          agendamento.status === "SCHEDULED"
            ? "AGENDADO"
            : agendamento.status === "CONFIRMED"
              ? "CONFIRMADO"
              : agendamento.status === "COMPLETED"
                ? "CONCLUIDO"
                : agendamento.status === "CANCELED"
                  ? "CANCELADO"
                  : "FALTOU",
        itens: agendamento.items.map((item) => ({
          idServico: item.serviceId,
          nomeServico: item.service.name,
          quantidade: item.quantity,
          precoUnitarioCentavos: item.unitPriceCents
        }))
      }
    });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Erro ao atualizar agendamento.";
    return NextResponse.json({ erro: mensagem }, { status: 422 });
  }
}
