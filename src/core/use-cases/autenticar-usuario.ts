import { ResultadoAutenticacao } from "@/core/entities/autenticacao";
import { RepositorioAutenticacao } from "@/core/repositories/repositorio-autenticacao";
import { gerarTokenAcesso } from "@/shared/seguranca/token";
import { validarSenha } from "@/shared/seguranca/senha";

interface EntradaAutenticacao {
  slugSalao: string;
  email: string;
  senha: string;
}

export class CasoDeUsoAutenticarUsuario {
  constructor(private readonly repositorioAutenticacao: RepositorioAutenticacao) {}

  async executar(entrada: EntradaAutenticacao): Promise<ResultadoAutenticacao> {
    const usuario = await this.repositorioAutenticacao.buscarUsuarioPorSlugEEmail(
      entrada.slugSalao,
      entrada.email
    );

    if (!usuario || !validarSenha(entrada.senha, usuario.hashSenha)) {
      throw new Error("Credenciais inválidas.");
    }

    const token = gerarTokenAcesso({
      sub: usuario.id,
      idSalao: usuario.idSalao,
      papel: usuario.papelPrincipal
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        idSalao: usuario.idSalao,
        nomeCompleto: usuario.nomeCompleto,
        email: usuario.email,
        papel: usuario.papelPrincipal
      }
    };
  }
}
