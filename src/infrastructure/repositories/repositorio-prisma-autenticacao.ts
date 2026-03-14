import {
  RepositorioAutenticacao,
  UsuarioAutenticacao
} from "@/core/repositories/repositorio-autenticacao";
import { prisma } from "@/infrastructure/db/prisma-client";

export class RepositorioPrismaAutenticacao implements RepositorioAutenticacao {
  async buscarUsuarioPorSlugEEmail(slugSalao: string, email: string): Promise<UsuarioAutenticacao | null> {
    const usuario = await prisma.user.findFirst({
      where: {
        email,
        tenant: {
          slug: slugSalao
        },
        status: "ACTIVE"
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!usuario) {
      return null;
    }

    return {
      id: usuario.id,
      idSalao: usuario.tenantId,
      nomeCompleto: usuario.fullName,
      email: usuario.email,
      hashSenha: usuario.passwordHash,
      papelPrincipal: usuario.roles[0]?.role.key ?? "RECEPCAO"
    };
  }
}
