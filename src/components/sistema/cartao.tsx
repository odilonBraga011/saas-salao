export function Cartao({
  titulo,
  children
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-stone-200 bg-white/85 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
      <h2 className="mb-4 text-lg font-semibold text-stone-900">{titulo}</h2>
      {children}
    </section>
  );
}
