import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/infrastructure/db/prisma-client";
import { criarServicoSchema, queryTenantSchema } from "@/shared/validacoes/cadastros";

export async function GET(request: NextRequest) {
  const parametros = Object.fromEntries(request.nextUrl.searchParams.entries());
  const validacao = queryTenantSchema.safeParse(parametros);

  if (!validacao.success) {
    return NextResponse.json(
      { erro: "Parâmetros inválidos.", detalhes: validacao.error.flatten() },
      { status: 400 }
    );
  }

  const servicos = await prisma.service.findMany({
    where: { tenantId: validacao.data.idSalao },
    orderBy: { name: "asc" }
  });

  return NextResponse.json({
    dados: servicos.map((servico) => ({
      id: servico.id,
      idSalao: servico.tenantId,
      nome: servico.name,
      descricao: servico.description,
      duracaoMin: servico.durationMin,
      precoBaseCentavos: servico.basePriceCents,
      ativo: servico.isActive
    }))
  });
}

export async function POST(request: NextRequest) {
  const validacao = criarServicoSchema.safeParse(await request.json());

  if (!validacao.success) {
    return NextResponse.json(
      { erro: "Dados inválidos para serviço.", detalhes: validacao.error.flatten() },
      { status: 400 }
    );
  }

  const servico = await prisma.service.create({
    data: {
      tenantId: validacao.data.idSalao,
      name: validacao.data.nome,
      description: validacao.data.descricao,
      durationMin: validacao.data.duracaoMin,
      basePriceCents: validacao.data.precoBaseCentavos
    }
  });

  return NextResponse.json(
    {
      dados: {
        id: servico.id,
        idSalao: servico.tenantId,
        nome: servico.name,
        descricao: servico.description,
        duracaoMin: servico.durationMin,
        precoBaseCentavos: servico.basePriceCents,
        ativo: servico.isActive
      }
    },
    { status: 201 }
  );
}
