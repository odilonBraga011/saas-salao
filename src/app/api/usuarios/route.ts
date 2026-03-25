import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { CasoDeUsoCriarUsuarioSalao } from "@/core/use-cases/criar-usuario-salao";
import { CasoDeUsoListarUsuariosSalao } from "@/core/use-cases/listar-usuarios-salao";
import { canAccess } from "@/infrastructure/auth/rbac";
import { RepositorioPrismaUsuario } from "@/infrastructure/repositories/repositorio-prisma-usuario";
import { criarUsuarioSchema, queryUsuariosSchema } from "@/shared/validacoes/usuario";

const repositorioUsuario = new RepositorioPrismaUsuario();

const obterPapel = (request: NextRequest): string =>
  request.headers.get("x-papel-usuario")?.toUpperCase() ?? "RECEPCAO";

export async function GET(request: NextRequest) {
  const papel = obterPapel(request);

  if (!canAccess(papel, "usuarios.gerenciar")) {
    return NextResponse.json({ erro: "Acesso negado para listar usuarios." }, { status: 403 });
  }

  const parametros = Object.fromEntries(request.nextUrl.searchParams.entries());
  const validacao = queryUsuariosSchema.safeParse(parametros);

  if (!validacao.success) {
    return NextResponse.json(
      { erro: "Parametros invalidos.", detalhes: validacao.error.flatten() },
      { status: 400 }
    );
  }

  const casoDeUso = new CasoDeUsoListarUsuariosSalao(repositorioUsuario);
  const usuarios = await casoDeUso.executar(validacao.data.idSalao);

  return NextResponse.json({ dados: usuarios });
}

export async function POST(request: NextRequest) {
  const papel = obterPapel(request);

  if (!canAccess(papel, "usuarios.gerenciar")) {
    return NextResponse.json({ erro: "Acesso negado para criar usuarios." }, { status: 403 });
  }

  const validacao = criarUsuarioSchema.safeParse(await request.json());

  if (!validacao.success) {
    return NextResponse.json(
      { erro: "Dados invalidos.", detalhes: validacao.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const casoDeUso = new CasoDeUsoCriarUsuarioSalao(repositorioUsuario);
    const usuario = await casoDeUso.executar(validacao.data);

    return NextResponse.json({ dados: usuario }, { status: 201 });
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
      return NextResponse.json(
        { erro: "Ja existe usuario com este email no salao informado." },
        { status: 409 }
      );
    }

    const mensagem = erro instanceof Error ? erro.message : "Erro ao criar usuario.";
    return NextResponse.json({ erro: mensagem }, { status: 422 });
  }
}
