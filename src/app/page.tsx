"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSessaoSistema } from "@/components/sistema/provedor-sessao";

export default function HomePage() {
  const router = useRouter();
  const { sessao, pronto } = useSessaoSistema();

  if (!pronto) {
    return <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">Carregando...</main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10 sm:py-14">
      <section className="rounded-[36px] border border-amber-200 bg-[linear-gradient(145deg,rgba(255,246,229,0.95),rgba(255,255,255,0.97))] p-8 shadow-[0_28px_90px_rgba(64,33,12,0.12)] sm:p-10">
        <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
          <Sparkles className="h-4 w-4" /> SaaS Salao
        </p>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-stone-950 sm:text-5xl">
          Gestao completa de salao com setup, operacao e analise.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
          Estrutura pronta para agendamentos, clientes, equipe, historico e painel gerencial.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-white bg-white/80 p-4">
            <CalendarDays className="mb-3 h-5 w-5 text-amber-700" />
            <p className="text-sm font-semibold text-stone-900">Agenda viva</p>
            <p className="mt-1 text-sm text-stone-600">Fluxo completo de atendimento.</p>
          </div>
          <div className="rounded-3xl border border-white bg-white/80 p-4">
            <ShieldCheck className="mb-3 h-5 w-5 text-amber-700" />
            <p className="text-sm font-semibold text-stone-900">RBAC</p>
            <p className="mt-1 text-sm text-stone-600">Usuarios com papeis e permissao.</p>
          </div>
          <div className="rounded-3xl border border-white bg-white/80 p-4">
            <Sparkles className="mb-3 h-5 w-5 text-amber-700" />
            <p className="text-sm font-semibold text-stone-900">Painel real</p>
            <p className="mt-1 text-sm text-stone-600">Faturamento e comparecimento.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {sessao ? (
            <Button onClick={() => router.push("/dashboard")}>Abrir sistema <ArrowRight className="ml-2 h-4 w-4" /></Button>
          ) : (
            <>
              <Button asChild><Link href="/login">Entrar</Link></Button>
              <Button asChild variant="outline"><Link href="/setup">Setup inicial</Link></Button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
