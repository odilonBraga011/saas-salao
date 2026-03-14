import {
  EntradaInicializacaoSistema,
  RepositorioInicializacao
} from "@/core/repositories/repositorio-inicializacao";
import { gerarHashSenha } from "@/shared/seguranca/senha";

export class CasoDeUsoInicializarSistema {
  constructor(private readonly repositorioInicializacao: RepositorioInicializacao) {}

  async executar(entrada: EntradaInicializacaoSistema): Promise<void> {
    const jaInicializado = await this.repositorioInicializacao.sistemaJaInicializado();

    if (jaInicializado) {
      throw new Error("Sistema já foi inicializado.");
    }

    if (entrada.senhaProprietario.length < 8) {
      throw new Error("Senha do proprietário deve ter no mínimo 8 caracteres.");
    }

    await this.repositorioInicializacao.inicializarSistema({
      ...entrada,
      senhaProprietario: gerarHashSenha(entrada.senhaProprietario)
    });
  }
}
