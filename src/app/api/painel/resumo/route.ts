import { NextRequest, NextResponse } from "next/server";

import { CasoDeUsoObterResumoPainelGerencial } from "@/core/use-cases/obter-resumo-painel-gerencial";
import { RepositorioPrismaAgendamento } from "@/infrastructure/repositories/repositorio-prisma-agendamento";
import { filtrosPainelGerencialSchema } from "@/shared/validacoes/painel-gerencial";

const repositorioAgendamento = new RepositorioPrismaAgendamento();

export async function GET(request: NextRequest) {
  const parametros = Object.fromEntries(request.nextUrl.searchParams.entries());
  const validacao = filtrosPainelGerencialSchema.safeParse(parametros);

  if (!validacao.success) {
    return NextResponse.json(
      { erro: "Parâmetros inválidos para resumo gerencial.", detalhes: validacao.error.flatten() },
      { status: 400 }
    );
  }

  const casoDeUso = new CasoDeUsoObterResumoPainelGerencial(repositorioAgendamento);
  const resumo = await casoDeUso.executar(validacao.data);

  return NextResponse.json({ dados: resumo });
}
