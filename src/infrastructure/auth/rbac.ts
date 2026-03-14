const permissoesPorPapel: Record<string, string[]> = {
  PROPRIETARIO: [
    "agendamentos.gerenciar",
    "servicos.gerenciar",
    "profissionais.gerenciar",
    "usuarios.gerenciar",
    "painel.visualizar"
  ],
  GERENTE: [
    "agendamentos.gerenciar",
    "servicos.gerenciar",
    "profissionais.gerenciar",
    "painel.visualizar"
  ],
  RECEPCAO: ["agendamentos.gerenciar", "clientes.gerenciar", "painel.visualizar"],
  PROFISSIONAL: ["agendamentos.visualizar.proprio"]
};

export function podeAcessar(papel: string, permissao: string): boolean {
  return permissoesPorPapel[papel]?.includes(permissao) ?? false;
}

// Alias para compatibilidade temporária.
export const canAccess = podeAcessar;
