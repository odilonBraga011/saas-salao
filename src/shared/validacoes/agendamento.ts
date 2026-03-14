import { z } from "zod";

export const statusAgendamentoSchema = z.enum([
  "AGENDADO",
  "CONFIRMADO",
  "CONCLUIDO",
  "CANCELADO",
  "FALTOU"
]);

export const criarAgendamentoSchema = z.object({
  idSalao: z.string().min(1),
  idCliente: z.string().min(1),
  idProfissional: z.string().min(1),
  inicioEm: z.coerce.date(),
  fimEm: z.coerce.date(),
  observacao: z.string().max(500).optional()
});

export const filtrosListagemAgendamentoSchema = z.object({
  idSalao: z.string().min(1),
  idProfissional: z.string().optional(),
  idCliente: z.string().optional(),
  status: statusAgendamentoSchema.optional(),
  inicioDe: z.coerce.date().optional(),
  inicioAte: z.coerce.date().optional()
});
