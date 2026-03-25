import { NextRequest, NextResponse } from "next/server";

import { CasoDeUsoCriarAgendamento } from "@/core/use-cases/criar-agendamento";
import { CasoDeUsoListarAgendamentos } from "@/core/use-cases/listar-agendamentos";
import { RepositorioPrismaAgendamento } from "@/infrastructure/repositories/repositorio-prisma-agendamento";
import {
  criarAgendamentoSchema,
  filtrosListagemAgendamentoSchema
} from "@/shared/validacoes/agendamento";

const repositorioAgendamento = new RepositorioPrismaAgendamento();

export async function GET(request: NextRequest) {
  const parametros = Object.fromEntries(request.nextUrl.searchParams.entries());
  const validacao = filtrosListagemAgendamentoSchema.safeParse(parametros);

  if (!validacao.success) {
    return NextResponse.json(
      { erro: "Parâmetros inválidos.", detalhes: validacao.error.flatten() },
      { status: 400 }
    );
  }

  const casoDeUso = new CasoDeUsoListarAgendamentos(repositorioAgendamento);
  const agendamentos = await casoDeUso.executar(validacao.data);

  return NextResponse.json({ dados: agendamentos });
}

export async function POST(request: NextRequest) {
  const corpo = await request.json();
  const validacao = criarAgendamentoSchema.safeParse(corpo);

  if (!validacao.success) {
    return NextResponse.json(
      { erro: "Dados inválidos.", detalhes: validacao.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const casoDeUso = new CasoDeUsoCriarAgendamento(repositorioAgendamento);
    const agendamento = await casoDeUso.executar(validacao.data);

    return NextResponse.json({ dados: agendamento }, { status: 201 });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Erro ao criar agendamento.";
    const status = /conflito|j[aá] possui agendamento/i.test(mensagem) ? 409 : 422;

    return NextResponse.json({ erro: mensagem }, { status });
  }
}
