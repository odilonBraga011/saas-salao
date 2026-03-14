import {
  EntradaInicializacaoSistema,
  RepositorioInicializacao
} from "@/core/repositories/repositorio-inicializacao";
import { prisma } from "@/infrastructure/db/prisma-client";

const papeisIniciais = [
  { key: "PROPRIETARIO", description: "Acesso total ao sistema" },
  { key: "GERENTE", description: "Gestão operacional do salão" },
  { key: "RECEPCAO", description: "Operação de agenda e clientes" },
  { key: "PROFISSIONAL", description: "Acesso à própria agenda" }
];

const permissoesIniciais = [
  { key: "agendamentos.gerenciar", description: "Gerenciar agendamentos" },
  { key: "clientes.gerenciar", description: "Gerenciar clientes" },
  { key: "servicos.gerenciar", description: "Gerenciar serviços" },
  { key: "profissionais.gerenciar", description: "Gerenciar profissionais" },
  { key: "usuarios.gerenciar", description: "Gerenciar usuários" },
  { key: "painel.visualizar", description: "Visualizar painel gerencial" }
];

export class RepositorioPrismaInicializacao implements RepositorioInicializacao {
  async sistemaJaInicializado(): Promise<boolean> {
    const total = await prisma.tenant.count();
    return total > 0;
  }

  async inicializarSistema(dados: EntradaInicializacaoSistema): Promise<void> {
    await prisma.$transaction(async (trx) => {
      const tenant = await trx.tenant.create({
        data: {
          name: dados.nomeSalao,
          slug: dados.slugSalao
        }
      });

      for (const papel of papeisIniciais) {
        await trx.role.upsert({
          where: { key: papel.key },
          create: papel,
          update: { description: papel.description }
        });
      }

      for (const permissao of permissoesIniciais) {
        await trx.permission.upsert({
          where: { key: permissao.key },
          create: permissao,
          update: { description: permissao.description }
        });
      }

      const usuario = await trx.user.create({
        data: {
          tenantId: tenant.id,
          fullName: dados.nomeProprietario,
          email: dados.emailProprietario,
          passwordHash: dados.senhaProprietario
        }
      });

      const papelProprietario = await trx.role.findUniqueOrThrow({ where: { key: "PROPRIETARIO" } });

      await trx.userRole.create({
        data: {
          userId: usuario.id,
          roleId: papelProprietario.id
        }
      });

      await trx.socialChannelConfig.createMany({
        data: [
          { tenantId: tenant.id, channel: "WHATSAPP", webhookUrl: "https://definir-webhook", isActive: false },
          { tenantId: tenant.id, channel: "INSTAGRAM", webhookUrl: "https://definir-webhook", isActive: false }
        ]
      });
    });
  }
}
