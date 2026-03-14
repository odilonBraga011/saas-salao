import { z } from "zod";

export const loginSchema = z.object({
  slugSalao: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(8)
});
