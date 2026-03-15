import { z } from "zod";

export const queryTenantSchema = z.object({
  idSalao: z.string().min(1)
});

export const criarClienteSchema = z.object({
  idSalao: z.string().min(1),
  nomeCompleto: z.string().min(3),
  telefone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  dataNascimento: z.coerce.date().optional()
});

export const criarProfissionalSchema = z.object({
  idSalao: z.string().min(1),
  nomeCompleto: z.string().min(3),
  especialidade: z.string().max(120).optional(),
  comissaoPercentual: z.coerce.number().min(0).max(100).optional()
});

export const criarServicoSchema = z.object({
  idSalao: z.string().min(1),
  nome: z.string().min(2),
  descricao: z.string().max(240).optional(),
  duracaoMin: z.coerce.number().int().min(5).max(1440),
  precoBaseCentavos: z.coerce.number().int().min(0)
});
