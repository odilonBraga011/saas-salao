import { NextRequest, NextResponse } from "next/server";

import { CasoDeUsoEnviarNotificacaoAgendamento } from "@/core/use-cases/enviar-notificacao-agendamento";
import { RepositorioPrismaAgendamento } from "@/infrastructure/repositories/repositorio-prisma-agendamento";
import { RepositorioPrismaNotificacao } from "@/infrastructure/repositories/repositorio-prisma-notificacao";
import { enviarNotificacaoSchema } from "@/shared/validacoes/notificacao";

interface ContextoRota {
  params: Promise<{ idAgendamento: string }>;
}

const repositorioAgendamento = new RepositorioPrismaAgendamento();
const repositorioNotificacao = new RepositorioPrismaNotificacao();

export async function POST(request: NextRequest, contexto: ContextoRota) {
  const { idAgendamento } = await contexto.params;
  const validacao = enviarNotificacaoSchema.safeParse(await request.json());

  if (!validacao.success) {
    return NextResponse.json(
      { erro: "Dados inválidos para envio de notificação.", detalhes: validacao.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const casoDeUso = new CasoDeUsoEnviarNotificacaoAgendamento(
      repositorioAgendamento,
      repositorioNotificacao
    );

    const resultado = await casoDeUso.executar({
      idAgendamento,
      ...validacao.data
    });

    return NextResponse.json({ dados: resultado }, { status: 201 });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Erro ao enviar notificação.";
    const status = mensagem.includes("não encontrado") ? 404 : 422;

    return NextResponse.json({ erro: mensagem }, { status });
  }
}
