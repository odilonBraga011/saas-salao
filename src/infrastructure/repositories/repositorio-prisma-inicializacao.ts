import {
  EntradaInicializacaoSistema,
  RepositorioInicializacao
} from "@/core/repositories/repositorio-inicializacao";
import { prisma } from "@/infrastructure/db/prisma-client";

import initialSetup from "../../../prisma/initial-setup.json";

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

      for (const papel of initialSetup.roles) {
        await trx.role.upsert({
          where: { key: papel.key },
          create: papel,
          update: { description: papel.description }
        });
      }

      for (const permissao of initialSetup.permissions) {
        await trx.permission.upsert({
          where: { key: permissao.key },
          create: permissao,
          update: { description: permissao.description }
        });
      }

      for (const [papelKey, permissoes] of Object.entries(initialSetup.rolePermissions)) {
        const papel = await trx.role.findUniqueOrThrow({ where: { key: papelKey } });

        for (const permissaoKey of permissoes) {
          const permissao = await trx.permission.findUniqueOrThrow({ where: { key: permissaoKey } });

          await trx.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: papel.id,
                permissionId: permissao.id
              }
            },
            update: {},
            create: {
              roleId: papel.id,
              permissionId: permissao.id
            }
          });
        }
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
        data: initialSetup.socialChannels.map((canal) => ({
          tenantId: tenant.id,
          channel: canal.channel,
          webhookUrl: canal.webhookUrl,
          isActive: canal.isActive
        }))
      });
    });
  }
}
