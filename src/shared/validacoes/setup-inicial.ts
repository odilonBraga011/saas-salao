import { z } from "zod";

export const setupInicialSchema = z.object({
  nomeSalao: z.string().min(3),
  slugSalao: z.string().min(2).regex(/^[a-z0-9-]+$/),
  nomeProprietario: z.string().min(3),
  emailProprietario: z.string().email(),
  senhaProprietario: z.string().min(8)
});
