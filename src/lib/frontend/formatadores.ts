export function formatarMoeda(valorCentavos: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    valorCentavos / 100
  );
}

export function formatarDataHora(valor?: string) {
  if (!valor) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(valor));
}

export function paraInputDataHora(data: Date) {
  return new Date(data.getTime() - data.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}
