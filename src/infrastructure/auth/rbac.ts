import initialSetup from "../../../prisma/initial-setup.json";

const permissoesPorPapel = initialSetup.rolePermissions as Record<string, string[]>;

export function podeAcessar(papel: string, permissao: string): boolean {
  return permissoesPorPapel[papel]?.includes(permissao) ?? false;
}

// Alias para compatibilidade temporaria.
export const canAccess = podeAcessar;
