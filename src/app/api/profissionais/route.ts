import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/infrastructure/db/prisma-client";
import { criarProfissionalSchema, queryTenantSchema } from "@/shared/validacoes/cadastros";

export async function GET(request: NextRequest) {
  const parametros = Object.fromEntries(request.nextUrl.searchParams.entries());
  const validacao = queryTenantSchema.safeParse(parametros);

  if (!validacao.success) {
    return NextResponse.json(
      { erro: "Parâmetros inválidos.", detalhes: validacao.error.flatten() },
      { status: 400 }
    );
  }

  const profissionais = await prisma.professional.findMany({
    where: { tenantId: validacao.data.idSalao },
    orderBy: { fullName: "asc" }
  });

  return NextResponse.json({
    dados: profissionais.map((profissional) => ({
      id: profissional.id,
      idSalao: profissional.tenantId,
      nomeCompleto: profissional.fullName,
      especialidade: profissional.specialty,
      ativo: profissional.isActive,
      comissaoPercentual: profissional.commissionPc ? Number(profissional.commissionPc) : null
    }))
  });
}

export async function POST(request: NextRequest) {
  const validacao = criarProfissionalSchema.safeParse(await request.json());

  if (!validacao.success) {
    return NextResponse.json(
      { erro: "Dados inválidos para profissional.", detalhes: validacao.error.flatten() },
      { status: 400 }
    );
  }

  const profissional = await prisma.professional.create({
    data: {
      tenantId: validacao.data.idSalao,
      fullName: validacao.data.nomeCompleto,
      specialty: validacao.data.especialidade,
      commissionPc: validacao.data.comissaoPercentual
    }
  });

  return NextResponse.json(
    {
      dados: {
        id: profissional.id,
        idSalao: profissional.tenantId,
        nomeCompleto: profissional.fullName,
        especialidade: profissional.specialty,
        ativo: profissional.isActive,
        comissaoPercentual: profissional.commissionPc ? Number(profissional.commissionPc) : null
      }
    },
    { status: 201 }
  );
}
