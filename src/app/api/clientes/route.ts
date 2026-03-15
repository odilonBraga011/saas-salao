import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/infrastructure/db/prisma-client";
import { criarClienteSchema, queryTenantSchema } from "@/shared/validacoes/cadastros";

export async function GET(request: NextRequest) {
  const parametros = Object.fromEntries(request.nextUrl.searchParams.entries());
  const validacao = queryTenantSchema.safeParse(parametros);

  if (!validacao.success) {
    return NextResponse.json(
      { erro: "Parâmetros inválidos.", detalhes: validacao.error.flatten() },
      { status: 400 }
    );
  }

  const clientes = await prisma.client.findMany({
    where: { tenantId: validacao.data.idSalao },
    orderBy: { fullName: "asc" }
  });

  return NextResponse.json({
    dados: clientes.map((cliente) => ({
      id: cliente.id,
      idSalao: cliente.tenantId,
      nomeCompleto: cliente.fullName,
      telefone: cliente.phone,
      email: cliente.email,
      dataNascimento: cliente.birthDate
    }))
  });
}

export async function POST(request: NextRequest) {
  const validacao = criarClienteSchema.safeParse(await request.json());

  if (!validacao.success) {
    return NextResponse.json(
      { erro: "Dados inválidos para cliente.", detalhes: validacao.error.flatten() },
      { status: 400 }
    );
  }

  const cliente = await prisma.client.create({
    data: {
      tenantId: validacao.data.idSalao,
      fullName: validacao.data.nomeCompleto,
      phone: validacao.data.telefone,
      email: validacao.data.email || null,
      birthDate: validacao.data.dataNascimento
    }
  });

  return NextResponse.json(
    {
      dados: {
        id: cliente.id,
        idSalao: cliente.tenantId,
        nomeCompleto: cliente.fullName,
        telefone: cliente.phone,
        email: cliente.email,
        dataNascimento: cliente.birthDate
      }
    },
    { status: 201 }
  );
}
