import {
  RepositorioAutenticacao,
  UsuarioAutenticacao
} from "@/core/repositories/repositorio-autenticacao";
import { escolherPapelPrincipal } from "@/infrastructure/auth/papeis";
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

    const papeis = usuario.roles.map((vinculo) => vinculo.role.key);

    return {
      id: usuario.id,
      idSalao: usuario.tenantId,
      nomeCompleto: usuario.fullName,
      email: usuario.email,
      hashSenha: usuario.passwordHash,
      papelPrincipal: escolherPapelPrincipal(papeis)
    };
  }
}
