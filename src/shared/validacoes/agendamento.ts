import { z } from "zod";

export const statusAgendamentoSchema = z.enum([
  "AGENDADO",
  "CONFIRMADO",
  "CONCLUIDO",
  "CANCELADO",
  "FALTOU"
]);

const itemAgendamentoSchema = z.object({
  idServico: z.string().min(1),
  quantidade: z.coerce.number().int().min(1).max(20).default(1),
  precoUnitarioCentavos: z.coerce.number().int().min(0).optional()
});

export const criarAgendamentoSchema = z.object({
  idSalao: z.string().min(1),
  idCliente: z.string().min(1),
  idProfissional: z.string().min(1),
  inicioEm: z.coerce.date(),
  fimEm: z.coerce.date(),
  observacao: z.string().max(500).optional(),
  itens: z.array(itemAgendamentoSchema).max(10).optional()
});

export const filtrosListagemAgendamentoSchema = z.object({
  idSalao: z.string().min(1),
  idProfissional: z.string().optional(),
  idCliente: z.string().optional(),
  status: statusAgendamentoSchema.optional(),
  inicioDe: z.coerce.date().optional(),
  inicioAte: z.coerce.date().optional()
});

export const atualizarAgendamentoSchema = z
  .object({
    idSalao: z.string().min(1),
    status: statusAgendamentoSchema.optional(),
    observacao: z.string().max(500).optional(),
    itens: z.array(itemAgendamentoSchema).max(10).optional()
  })
  .refine((valor) => valor.status || valor.observacao !== undefined || valor.itens, {
    message: "Informe pelo menos um campo para atualizar."
  });
