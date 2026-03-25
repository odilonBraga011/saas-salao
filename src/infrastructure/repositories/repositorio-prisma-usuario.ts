import {
  EntidadeUsuarioInterno,
  RepositorioUsuario
} from "@/core/repositories/repositorio-usuario";
import { escolherPapelPrincipal } from "@/infrastructure/auth/papeis";
import { prisma } from "@/infrastructure/db/prisma-client";

const mapaStatusDoPrisma = {
  ACTIVE: "ATIVO",
  INACTIVE: "INATIVO",
  BLOCKED: "BLOQUEADO"
} as const;

export class RepositorioPrismaUsuario implements RepositorioUsuario {
  async listarPorSalao(idSalao: string): Promise<EntidadeUsuarioInterno[]> {
    const usuarios = await prisma.user.findMany({
      where: { tenantId: idSalao },
      include: {
        roles: {
          include: {
            role: {
              select: { key: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return usuarios.map((usuario) => ({
      id: usuario.id,
      idSalao: usuario.tenantId,
      nomeCompleto: usuario.fullName,
      email: usuario.email,
      papel: escolherPapelPrincipal(usuario.roles.map((vinculo) => vinculo.role.key)),
      status: mapaStatusDoPrisma[usuario.status]
    }));
  }

  async criar(dados: {
    idSalao: string;
    nomeCompleto: string;
    email: string;
    hashSenha: string;
    papel?: string;
  }): Promise<EntidadeUsuarioInterno> {
    const papelSelecionado = dados.papel ?? "RECEPCAO";

    return prisma.$transaction(async (trx) => {
      const papel = await trx.role.findUnique({
        where: { key: papelSelecionado },
        select: { id: true, key: true }
      });

      if (!papel) {
        throw new Error("Papel informado nao existe.");
      }

      const usuario = await trx.user.create({
        data: {
          tenantId: dados.idSalao,
          fullName: dados.nomeCompleto,
          email: dados.email,
          passwordHash: dados.hashSenha,
          roles: {
            create: {
              roleId: papel.id
            }
          }
        }
      });

      return {
        id: usuario.id,
        idSalao: usuario.tenantId,
        nomeCompleto: usuario.fullName,
        email: usuario.email,
        papel: papel.key,
        status: mapaStatusDoPrisma[usuario.status]
      };
    });
  }
}
