import { NextRequest, NextResponse } from "next/server";

import { CasoDeUsoInicializarSistema } from "@/core/use-cases/inicializar-sistema";
import { RepositorioPrismaInicializacao } from "@/infrastructure/repositories/repositorio-prisma-inicializacao";
import { setupInicialSchema } from "@/shared/validacoes/setup-inicial";

const repositorioInicializacao = new RepositorioPrismaInicializacao();

export async function POST(request: NextRequest) {
  const validacao = setupInicialSchema.safeParse(await request.json());

  if (!validacao.success) {
    return NextResponse.json(
      { erro: "Dados inválidos para inicialização.", detalhes: validacao.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const casoDeUso = new CasoDeUsoInicializarSistema(repositorioInicializacao);
    await casoDeUso.executar(validacao.data);

    return NextResponse.json(
      { mensagem: "Sistema inicializado com sucesso. Faça login para continuar." },
      { status: 201 }
    );
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Erro ao inicializar sistema.";
    const status = mensagem.includes("já foi inicializado") ? 409 : 422;
    return NextResponse.json({ erro: mensagem }, { status });
  }
}
