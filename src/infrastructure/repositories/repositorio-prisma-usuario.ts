import {
  EntidadeUsuarioInterno,
  RepositorioUsuario
} from "@/core/repositories/repositorio-usuario";
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
      orderBy: { createdAt: "desc" }
    });

    return usuarios.map((usuario) => ({
      id: usuario.id,
      idSalao: usuario.tenantId,
      nomeCompleto: usuario.fullName,
      email: usuario.email,
      status: mapaStatusDoPrisma[usuario.status]
    }));
  }

  async criar(dados: {
    idSalao: string;
    nomeCompleto: string;
    email: string;
    hashSenha: string;
  }): Promise<EntidadeUsuarioInterno> {
    const usuario = await prisma.user.create({
      data: {
        tenantId: dados.idSalao,
        fullName: dados.nomeCompleto,
        email: dados.email,
        passwordHash: dados.hashSenha
      }
    });

    return {
      id: usuario.id,
      idSalao: usuario.tenantId,
      nomeCompleto: usuario.fullName,
      email: usuario.email,
      status: mapaStatusDoPrisma[usuario.status]
    };
  }
}
