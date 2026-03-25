import { Prisma } from "@prisma/client";

import { EntidadeAgendamento, EntidadeHistoricoCliente } from "@/core/entities/agendamento";
import { ResumoPainelGerencial } from "@/core/entities/painel-gerencial";
import {
  FiltrosListagemAgendamentos,
  FiltrosPainelGerencial,
  RepositorioAgendamento
} from "@/core/repositories/repositorio-agendamento";
import { prisma } from "@/infrastructure/db/prisma-client";

const mapaStatusParaPrisma = {
  AGENDADO: "SCHEDULED",
  CONFIRMADO: "CONFIRMED",
  CONCLUIDO: "COMPLETED",
  CANCELADO: "CANCELED",
  FALTOU: "NO_SHOW"
} as const;

const mapaStatusDoPrisma = {
  SCHEDULED: "AGENDADO",
  CONFIRMED: "CONFIRMADO",
  COMPLETED: "CONCLUIDO",
  CANCELED: "CANCELADO",
  NO_SHOW: "FALTOU"
} as const;

const montarPeriodo = (inicioDe?: Date, inicioAte?: Date): Prisma.DateTimeFilter | undefined => {
  if (!inicioDe && !inicioAte) {
    return undefined;
  }

  return {
    gte: inicioDe,
    lte: inicioAte
  };
};

export class RepositorioPrismaAgendamento implements RepositorioAgendamento {
  async criar(dados: Omit<EntidadeAgendamento, "id">): Promise<EntidadeAgendamento> {
    return prisma.$transaction(async (trx) => {
      await this.validarRelacionamentosAgendamento(
        trx,
        dados.idSalao,
        dados.idCliente,
        dados.idProfissional
      );

      const itens = await this.resolverItensAgendamento(
        trx,
        dados.idSalao,
        dados.itens
      );

      const agendamento = await trx.appointment.create({
        data: {
          tenantId: dados.idSalao,
          clientId: dados.idCliente,
          professionalId: dados.idProfissional,
          startsAt: dados.inicioEm,
          endsAt: dados.fimEm,
          note: dados.observacao,
          status: mapaStatusParaPrisma[dados.status],
          items: itens.length > 0 ? { create: itens } : undefined
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

      return this.mapearParaEntidade(agendamento);
    });
  }

  async listar(filtros: FiltrosListagemAgendamentos): Promise<EntidadeAgendamento[]> {
    const where: Prisma.AppointmentWhereInput = {
      tenantId: filtros.idSalao,
      professionalId: filtros.idProfissional,
      clientId: filtros.idCliente,
      status: filtros.status ? mapaStatusParaPrisma[filtros.status] : undefined,
      startsAt: montarPeriodo(filtros.inicioDe, filtros.inicioAte)
    };

    const agendamentos = await prisma.appointment.findMany({
      where,
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
      },
      orderBy: { startsAt: "asc" }
    });

    return agendamentos.map((agendamento) => this.mapearParaEntidade(agendamento));
  }

  async existeConflitoDeHorario(params: {
    idSalao: string;
    idProfissional: string;
    inicioEm: Date;
    fimEm: Date;
  }): Promise<boolean> {
    const quantidade = await prisma.appointment.count({
      where: {
        tenantId: params.idSalao,
        professionalId: params.idProfissional,
        status: { in: ["SCHEDULED", "CONFIRMED"] },
        startsAt: { lt: params.fimEm },
        endsAt: { gt: params.inicioEm }
      }
    });

    return quantidade > 0;
  }

  async obterHistoricoCliente(idSalao: string, idCliente: string): Promise<EntidadeHistoricoCliente | null> {
    const cliente = await prisma.client.findFirst({
      where: { id: idCliente, tenantId: idSalao },
      select: { id: true, fullName: true }
    });

    if (!cliente) {
      return null;
    }

    const atendimentos = await prisma.appointment.findMany({
      where: {
        tenantId: idSalao,
        clientId: idCliente,
        status: "COMPLETED"
      },
      include: {
        items: {
          include: {
            service: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { startsAt: "desc" }
    });

    const servicosAgrupados = new Map<
      string,
      { idServico: string; nomeServico: string; quantidade: number; valorTotalCentavos: number }
    >();

    for (const atendimento of atendimentos) {
      for (const item of atendimento.items) {
        const acumulado = servicosAgrupados.get(item.serviceId);
        const valorItem = item.unitPriceCents * item.quantity;

        if (acumulado) {
          acumulado.quantidade += item.quantity;
          acumulado.valorTotalCentavos += valorItem;
          continue;
        }

        servicosAgrupados.set(item.serviceId, {
          idServico: item.serviceId,
          nomeServico: item.service.name,
          quantidade: item.quantity,
          valorTotalCentavos: valorItem
        });
      }
    }

    return {
      idCliente: cliente.id,
      nomeCliente: cliente.fullName,
      totalAtendimentos: atendimentos.length,
      ultimoAtendimentoEm: atendimentos[0]?.startsAt,
      servicos: Array.from(servicosAgrupados.values()).sort((a, b) => b.quantidade - a.quantidade)
    };
  }

  async obterResumoPainelGerencial(filtros: FiltrosPainelGerencial): Promise<ResumoPainelGerencial> {
    const whereBase: Prisma.AppointmentWhereInput = {
      tenantId: filtros.idSalao,
      startsAt: montarPeriodo(filtros.inicioDe, filtros.inicioAte)
    };

    const [agendamentos, concluidos, cancelados, faltas, itensConcluidos, topProfissionais, topServicos] =
      await Promise.all([
        prisma.appointment.count({ where: whereBase }),
        prisma.appointment.count({ where: { ...whereBase, status: "COMPLETED" } }),
        prisma.appointment.count({ where: { ...whereBase, status: "CANCELED" } }),
        prisma.appointment.count({ where: { ...whereBase, status: "NO_SHOW" } }),
        prisma.appointmentItem.findMany({
          where: {
            appointment: {
              ...whereBase,
              status: "COMPLETED"
            }
          },
          select: {
            quantity: true,
            unitPriceCents: true
          }
        }),
        prisma.appointment.groupBy({
          by: ["professionalId"],
          where: {
            ...whereBase,
            status: "COMPLETED"
          },
          _count: {
            _all: true
          },
          orderBy: {
            _count: {
              id: "desc"
            }
          },
          take: 5
        }),
        prisma.appointmentItem.groupBy({
          by: ["serviceId"],
          where: {
            appointment: {
              ...whereBase,
              status: "COMPLETED"
            }
          },
          _sum: {
            quantity: true
          },
          orderBy: {
            _sum: {
              quantity: "desc"
            }
          },
          take: 5
        })
      ]);

    const faturamentoCentavos = itensConcluidos.reduce(
      (total, item) => total + item.unitPriceCents * item.quantity,
      0
    );

    const profissionaisIds = topProfissionais.map((item) => item.professionalId);
    const servicosIds = topServicos.map((item) => item.serviceId);

    const [profissionais, servicos] = await Promise.all([
      prisma.professional.findMany({
        where: { id: { in: profissionaisIds } },
        select: { id: true, fullName: true }
      }),
      prisma.service.findMany({
        where: { id: { in: servicosIds } },
        select: { id: true, name: true }
      })
    ]);

    const mapaProfissionais = new Map(profissionais.map((item) => [item.id, item.fullName]));
    const mapaServicos = new Map(servicos.map((item) => [item.id, item.name]));

    const servicosMaisVendidos = await Promise.all(
      topServicos.map(async (item) => {
        const itens = await prisma.appointmentItem.findMany({
          where: {
            serviceId: item.serviceId,
            appointment: {
              ...whereBase,
              status: "COMPLETED"
            }
          },
          select: { quantity: true, unitPriceCents: true }
        });

        return {
          idServico: item.serviceId,
          nomeServico: mapaServicos.get(item.serviceId) ?? "Serviço não identificado",
          quantidade: item._sum.quantity ?? 0,
          faturamentoCentavos: itens.reduce((total, atual) => total + atual.quantity * atual.unitPriceCents, 0)
        };
      })
    );

    const taxaComparecimentoPercentual =
      agendamentos > 0 ? Number((((concluidos + faltas) / agendamentos) * 100).toFixed(2)) : 0;

    return {
      periodo: {
        inicioDe: filtros.inicioDe,
        inicioAte: filtros.inicioAte
      },
      totais: {
        agendamentos,
        concluidos,
        cancelados,
        faltas,
        faturamentoCentavos
      },
      taxaComparecimentoPercentual,
      profissionaisMaisAtivos: topProfissionais.map((item) => ({
        idProfissional: item.professionalId,
        nomeProfissional: mapaProfissionais.get(item.professionalId) ?? "Profissional não identificado",
        totalAtendimentos: item._count._all
      })),
      servicosMaisVendidos
    };
  }

  private async validarRelacionamentosAgendamento(
    trx: Prisma.TransactionClient,
    idSalao: string,
    idCliente: string,
    idProfissional: string
  ): Promise<void> {
    const [cliente, profissional] = await Promise.all([
      trx.client.findFirst({
        where: {
          id: idCliente,
          tenantId: idSalao
        },
        select: { id: true }
      }),
      trx.professional.findFirst({
        where: {
          id: idProfissional,
          tenantId: idSalao,
          isActive: true
        },
        select: { id: true }
      })
    ]);

    if (!cliente) {
      throw new Error("Cliente informado nao pertence ao salao.");
    }

    if (!profissional) {
      throw new Error("Profissional informado nao pertence ao salao ou esta inativo.");
    }
  }

  private async resolverItensAgendamento(
    trx: Prisma.TransactionClient,
    idSalao: string,
    itens?: EntidadeAgendamento["itens"]
  ): Promise<Array<{ serviceId: string; quantity: number; unitPriceCents: number }>> {
    if (!itens || itens.length === 0) {
      return [];
    }

    const idsServicos = [...new Set(itens.map((item) => item.idServico))];
    const servicos = await trx.service.findMany({
      where: {
        tenantId: idSalao,
        id: { in: idsServicos }
      },
      select: {
        id: true,
        name: true,
        basePriceCents: true
      }
    });

    if (servicos.length !== idsServicos.length) {
      throw new Error("Um ou mais servicos informados nao pertencem ao salao.");
    }

    const mapaServicos = new Map(servicos.map((servico) => [servico.id, servico]));

    return itens.map((item) => {
      const servico = mapaServicos.get(item.idServico);

      if (!servico) {
        throw new Error("Servico informado nao encontrado.");
      }

      return {
        serviceId: item.idServico,
        quantity: item.quantidade,
        unitPriceCents: item.precoUnitarioCentavos ?? servico.basePriceCents
      };
    });
  }

  private mapearParaEntidade(agendamento: {
    id: string;
    tenantId: string;
    clientId: string;
    professionalId: string;
    startsAt: Date;
    endsAt: Date;
    note: string | null;
    status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "NO_SHOW";
    client?: { fullName: string } | null;
    professional?: { fullName: string } | null;
    items?: Array<{
      serviceId: string;
      quantity: number;
      unitPriceCents: number;
      service: { id: string; name: string };
    }>;
  }): EntidadeAgendamento {
    return {
      id: agendamento.id,
      idSalao: agendamento.tenantId,
      idCliente: agendamento.clientId,
      idProfissional: agendamento.professionalId,
      nomeCliente: agendamento.client?.fullName,
      nomeProfissional: agendamento.professional?.fullName,
      inicioEm: agendamento.startsAt,
      fimEm: agendamento.endsAt,
      observacao: agendamento.note ?? undefined,
      status: mapaStatusDoPrisma[agendamento.status],
      itens: agendamento.items?.map((item) => ({
        idServico: item.serviceId,
        nomeServico: item.service.name,
        quantidade: item.quantity,
        precoUnitarioCentavos: item.unitPriceCents
      }))
    };
  }
}
