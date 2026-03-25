"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, ChartColumnIncreasing, Clock3, LogOut, Sparkles, Users } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useSessaoSistema } from "@/components/sistema/provedor-sessao";

const itensMenu = [
  { href: "/dashboard", rotulo: "Dashboard", icone: ChartColumnIncreasing },
  { href: "/agenda", rotulo: "Agenda", icone: CalendarDays },
  { href: "/cadastros", rotulo: "Cadastros", icone: Sparkles },
  { href: "/usuarios", rotulo: "Usuarios", icone: Users },
  { href: "/historico", rotulo: "Historico", icone: Clock3 }
] as const;

export function LayoutOperacao({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { sessao, pronto, limparSessao } = useSessaoSistema();

  useEffect(() => {
    if (pronto && !sessao) {
      router.replace("/login");
    }
  }, [pronto, router, sessao]);

  if (!pronto || !sessao) {
    return <main className="mx-auto min-h-screen max-w-7xl px-6 py-12">Carregando...</main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-6 sm:px-8">
      <section className="rounded-[36px] border border-amber-200 bg-[linear-gradient(135deg,rgba(255,245,229,0.96),rgba(255,255,255,0.95))] p-6 shadow-[0_28px_90px_rgba(64,33,12,0.12)] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Workspace</p>
            <h1 className="text-2xl font-semibold text-stone-950 sm:text-3xl">
              {sessao.usuario.nomeCompleto}
            </h1>
            <p className="text-sm text-stone-600">
              {sessao.usuario.email} - {sessao.usuario.papel}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              limparSessao();
              router.replace("/login");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[240px_1fr]">
        <aside className="rounded-[30px] border border-stone-200 bg-white/80 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <nav className="grid gap-2">
            {itensMenu.map(({ href, rotulo, icone: Icone }) => {
              const ativo = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={
                    ativo
                      ? "flex items-center gap-3 rounded-3xl border border-amber-300 bg-amber-50 px-4 py-4 text-left font-semibold text-stone-900"
                      : "flex items-center gap-3 rounded-3xl px-4 py-4 text-left text-stone-600 hover:bg-stone-50"
                  }
                >
                  <Icone className="h-4 w-4" />
                  <span>{rotulo}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <section className="space-y-6">{children}</section>
      </section>
    </main>
  );
}
