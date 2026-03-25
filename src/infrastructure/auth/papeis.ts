const ordemPrioridadePapeis = ["PROPRIETARIO", "GERENTE", "RECEPCAO", "PROFISSIONAL"] as const;

const prioridadePapel = new Map<string, number>(
  ordemPrioridadePapeis.map((papel, indice) => [papel, indice])
);

export function escolherPapelPrincipal(papeis: string[]): string {
  if (papeis.length === 0) {
    return "RECEPCAO";
  }

  return [...papeis].sort((papelA, papelB) => {
    const prioridadeA = prioridadePapel.get(papelA) ?? Number.MAX_SAFE_INTEGER;
    const prioridadeB = prioridadePapel.get(papelB) ?? Number.MAX_SAFE_INTEGER;
    return prioridadeA - prioridadeB;
  })[0];
}
