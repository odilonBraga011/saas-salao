"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Alerta } from "@/components/sistema/alerta";
import { Cartao } from "@/components/sistema/cartao";
import { classeInputPadrao } from "@/components/sistema/estilos";
import { useSessaoSistema } from "@/components/sistema/provedor-sessao";
import { Button } from "@/components/ui/button";
import { chamarApi } from "@/lib/frontend/api";
import { Sessao } from "@/lib/frontend/tipos";

export default function LoginPage() {
  const router = useRouter();
  const { salvarSessao } = useSessaoSistema();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState({
    slugSalao: "salao-exemplo",
    email: "ana@salao.com",
    senha: "SenhaForte123"
  });

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-10 sm:py-14">
      <Cartao titulo="Login operacional">
        <div className="space-y-3">
          {erro ? <Alerta tipo="erro" texto={erro} /> : null}
          <form
            className="grid gap-3"
            onSubmit={(evento) => {
              evento.preventDefault();
              setErro(null);
              startTransition(() => {
                void chamarApi<Sessao>("/api/auth/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(form)
                })
                  .then((sessao) => {
                    salvarSessao(sessao);
                    router.push("/dashboard");
                  })
                  .catch((e) => setErro(e instanceof Error ? e.message : "Falha ao autenticar."));
              });
            }}
          >
            <input
              className={classeInputPadrao}
              placeholder="Slug do salao"
              value={form.slugSalao}
              onChange={(e) => setForm((atual) => ({ ...atual, slugSalao: e.target.value }))}
            />
            <input
              className={classeInputPadrao}
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((atual) => ({ ...atual, email: e.target.value }))}
            />
            <input
              className={classeInputPadrao}
              type="password"
              placeholder="Senha"
              value={form.senha}
              onChange={(e) => setForm((atual) => ({ ...atual, senha: e.target.value }))}
            />
            <Button type="submit" disabled={pending}>
              Entrar
            </Button>
          </form>
          <p className="text-sm text-stone-600">
            Ainda sem setup?{" "}
            <Link className="font-semibold text-amber-700 hover:underline" href="/setup">
              Inicializar sistema
            </Link>
          </p>
        </div>
      </Cartao>
    </main>
  );
}
