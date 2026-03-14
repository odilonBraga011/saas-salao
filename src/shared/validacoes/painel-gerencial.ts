import { z } from "zod";

export const filtrosPainelGerencialSchema = z.object({
  idSalao: z.string().min(1),
  inicioDe: z.coerce.date().optional(),
  inicioAte: z.coerce.date().optional()
});
