export async function chamarApi<T>(url: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(url, init);
  const corpo = (await resposta.json().catch(() => ({}))) as { dados?: T; erro?: string };

  if (!resposta.ok) {
    throw new Error(corpo.erro ?? "Falha na requisicao.");
  }

  return (corpo.dados ?? corpo) as T;
}
