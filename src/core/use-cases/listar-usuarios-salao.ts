import {
  EntidadeUsuarioInterno,
  RepositorioUsuario
} from "@/core/repositories/repositorio-usuario";

export class CasoDeUsoListarUsuariosSalao {
  constructor(private readonly repositorioUsuario: RepositorioUsuario) {}

  async executar(idSalao: string): Promise<EntidadeUsuarioInterno[]> {
    return this.repositorioUsuario.listarPorSalao(idSalao);
  }
}
