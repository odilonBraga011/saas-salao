import { z } from "zod";

export const enviarNotificacaoSchema = z.object({
  idSalao: z.string().min(1),
  canal: z.enum(["WHATSAPP", "INSTAGRAM"]),
  destino: z.string().min(3),
  mensagem: z.string().max(500).optional()
});
