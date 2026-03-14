import {
  EntidadeUsuarioInterno,
  RepositorioUsuario
} from "@/core/repositories/repositorio-usuario";
import { gerarHashSenha } from "@/shared/seguranca/senha";

interface EntradaCriarUsuarioSalao {
  idSalao: string;
  nomeCompleto: string;
  email: string;
  senha: string;
}

export class CasoDeUsoCriarUsuarioSalao {
  constructor(private readonly repositorioUsuario: RepositorioUsuario) {}

  async executar(entrada: EntradaCriarUsuarioSalao): Promise<EntidadeUsuarioInterno> {
    if (entrada.senha.length < 8) {
      throw new Error("A senha deve possuir no mínimo 8 caracteres.");
    }

    return this.repositorioUsuario.criar({
      idSalao: entrada.idSalao,
      nomeCompleto: entrada.nomeCompleto,
      email: entrada.email,
      hashSenha: gerarHashSenha(entrada.senha)
    });
  }
}
