import { z } from "zod";

export const queryUsuariosSchema = z.object({
  idSalao: z.string().min(1)
});

export const criarUsuarioSchema = z.object({
  idSalao: z.string().min(1),
  nomeCompleto: z.string().min(3),
  email: z.string().email(),
  senha: z.string().min(8),
  papel: z.enum(["PROPRIETARIO", "GERENTE", "RECEPCAO", "PROFISSIONAL"]).optional()
});
