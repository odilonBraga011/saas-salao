import { NextRequest, NextResponse } from "next/server";

import { CasoDeUsoObterHistoricoCliente } from "@/core/use-cases/obter-historico-cliente";
import { RepositorioPrismaAgendamento } from "@/infrastructure/repositories/repositorio-prisma-agendamento";

const repositorioAgendamento = new RepositorioPrismaAgendamento();

interface ContextoRota {
  params: Promise<{ idCliente: string }>;
}

export async function GET(request: NextRequest, contexto: ContextoRota) {
  const { idCliente } = await contexto.params;
  const idSalao = request.nextUrl.searchParams.get("idSalao");

  if (!idSalao) {
    return NextResponse.json({ erro: "Parâmetro idSalao é obrigatório." }, { status: 400 });
  }

  const casoDeUso = new CasoDeUsoObterHistoricoCliente(repositorioAgendamento);
  const historico = await casoDeUso.executar(idSalao, idCliente);

  if (!historico) {
    return NextResponse.json({ erro: "Cliente não encontrado para o salão informado." }, { status: 404 });
  }

  return NextResponse.json({ dados: historico });
}
