"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { Alerta } from "@/components/sistema/alerta";
import { Cartao } from "@/components/sistema/cartao";
import { classeInputPadrao } from "@/components/sistema/estilos";
import { Button } from "@/components/ui/button";
import { chamarApi } from "@/lib/frontend/api";

export default function SetupPage() {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [form, setForm] = useState({
    nomeSalao: "Salao Exemplo",
    slugSalao: "salao-exemplo",
    nomeProprietario: "Ana Souza",
    emailProprietario: "ana@salao.com",
    senhaProprietario: "SenhaForte123"
  });

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-10 sm:py-14">
      <Cartao titulo="Setup inicial do sistema">
        <div className="space-y-3">
          {mensagem ? <Alerta tipo="sucesso" texto={mensagem} /> : null}
          {erro ? <Alerta tipo="erro" texto={erro} /> : null}
          <form
            className="grid gap-3"
            onSubmit={(evento) => {
              evento.preventDefault();
              setErro(null);
              setMensagem(null);
              startTransition(() => {
                void chamarApi("/api/setup/inicial", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(form)
                })
                  .then(() => setMensagem("Setup concluido. Agora faca login para usar o sistema."))
                  .catch((e) => setErro(e instanceof Error ? e.message : "Falha ao inicializar sistema."));
              });
            }}
          >
            {(
              [
                ["nomeSalao", "Nome do salao", "text"],
                ["slugSalao", "Slug", "text"],
                ["nomeProprietario", "Nome do proprietario", "text"],
                ["emailProprietario", "Email do proprietario", "email"],
                ["senhaProprietario", "Senha", "password"]
              ] as const
            ).map(([campo, placeholder, tipo]) => (
              <input
                key={campo}
                className={classeInputPadrao}
                placeholder={placeholder}
                type={tipo}
                value={form[campo]}
                onChange={(e) => setForm((atual) => ({ ...atual, [campo]: e.target.value }))}
              />
            ))}
            <Button type="submit" disabled={pending}>
              Inicializar
            </Button>
          </form>
          <p className="text-sm text-stone-600">
            Ja tem setup? <Link className="font-semibold text-amber-700 hover:underline" href="/login">Entrar no sistema</Link>
          </p>
        </div>
      </Cartao>
    </main>
  );
}
