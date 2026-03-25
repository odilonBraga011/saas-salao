export function Alerta({ tipo, texto }: { tipo: "erro" | "sucesso"; texto: string }) {
  if (!texto) {
    return null;
  }

  if (tipo === "erro") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {texto}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      {texto}
    </div>
  );
}
