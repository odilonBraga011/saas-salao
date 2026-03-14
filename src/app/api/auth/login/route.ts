import { NextRequest, NextResponse } from "next/server";

import { CasoDeUsoAutenticarUsuario } from "@/core/use-cases/autenticar-usuario";
import { RepositorioPrismaAutenticacao } from "@/infrastructure/repositories/repositorio-prisma-autenticacao";
import { loginSchema } from "@/shared/validacoes/autenticacao";

const repositorioAutenticacao = new RepositorioPrismaAutenticacao();

export async function POST(request: NextRequest) {
  const validacao = loginSchema.safeParse(await request.json());

  if (!validacao.success) {
    return NextResponse.json(
      { erro: "Dados inválidos para login.", detalhes: validacao.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const casoDeUso = new CasoDeUsoAutenticarUsuario(repositorioAutenticacao);
    const autenticacao = await casoDeUso.executar(validacao.data);

    return NextResponse.json({ dados: autenticacao });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Erro ao autenticar usuário.";
    return NextResponse.json({ erro: mensagem }, { status: 401 });
  }
}
