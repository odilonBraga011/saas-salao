"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { Alerta } from "@/components/sistema/alerta";
import { Cartao } from "@/components/sistema/cartao";
import { classeInputPadrao } from "@/components/sistema/estilos";
import { useSessaoSistema } from "@/components/sistema/provedor-sessao";
import { Button } from "@/components/ui/button";
import { canAccess } from "@/infrastructure/auth/rbac";
import { chamarApi } from "@/lib/frontend/api";
import { UsuarioInterno } from "@/lib/frontend/tipos";

export default function UsuariosPage() {
  const { sessao } = useSessaoSistema();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioInterno[]>([]);
  const [form, setForm] = useState({
    nomeCompleto: "",
    email: "",
    senha: "",
    papel: "RECEPCAO"
  });

  const podeGerenciarUsuarios = useMemo(
    () => (sessao ? canAccess(sessao.usuario.papel, "usuarios.gerenciar") : false),
    [sessao]
  );

  const carregarUsuarios = useCallback(() => {
    if (!sessao || !podeGerenciarUsuarios) {
      setUsuarios([]);
      return;
    }

    setErro(null);
    startTransition(() => {
      void chamarApi<UsuarioInterno[]>(`/api/usuarios?idSalao=${sessao.usuario.idSalao}`, {
        headers: { "x-papel-usuario": sessao.usuario.papel }
      })
        .then(setUsuarios)
        .catch((e) => setErro(e instanceof Error ? e.message : "Falha ao carregar usuarios."));
    });
  }, [podeGerenciarUsuarios, sessao]);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  return (
    <>
      {mensagem ? <Alerta tipo="sucesso" texto={mensagem} /> : null}
      {erro ? <Alerta tipo="erro" texto={erro} /> : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Cartao titulo="Novo usuario interno">
          {podeGerenciarUsuarios ? (
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!sessao) return;
                setErro(null);
                setMensagem(null);
                startTransition(() => {
                  void chamarApi("/api/usuarios", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "x-papel-usuario": sessao.usuario.papel
                    },
                    body: JSON.stringify({
                      idSalao: sessao.usuario.idSalao,
                      ...form
                    })
                  })
                    .then(async () => {
                      setForm({
                        nomeCompleto: "",
                        email: "",
                        senha: "",
                        papel: "RECEPCAO"
                      });
                      setMensagem("Usuario criado.");
                      await carregarUsuarios();
                    })
                    .catch((err) => setErro(err instanceof Error ? err.message : "Falha ao criar usuario."));
                });
              }}
            >
              <input
                className={classeInputPadrao}
                placeholder="Nome"
                value={form.nomeCompleto}
                onChange={(e) => setForm((atual) => ({ ...atual, nomeCompleto: e.target.value }))}
              />
              <input
                className={classeInputPadrao}
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((atual) => ({ ...atual, email: e.target.value }))}
              />
              <input
                className={classeInputPadrao}
                placeholder="Senha"
                type="password"
                value={form.senha}
                onChange={(e) => setForm((atual) => ({ ...atual, senha: e.target.value }))}
              />
              <select
                className={classeInputPadrao}
                value={form.papel}
                onChange={(e) => setForm((atual) => ({ ...atual, papel: e.target.value }))}
              >
                <option value="RECEPCAO">Recepcao</option>
                <option value="GERENTE">Gerente</option>
                <option value="PROFISSIONAL">Profissional</option>
                <option value="PROPRIETARIO">Proprietario</option>
              </select>
              <Button type="submit" disabled={pending}>
                Criar usuario
              </Button>
            </form>
          ) : (
            <p className="text-sm text-stone-500">O papel atual nao pode criar usuarios.</p>
          )}
        </Cartao>

        <Cartao titulo="Equipe interna">
          <div className="space-y-3">
            {usuarios.length ? (
              usuarios.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-stone-900">{item.nomeCompleto}</p>
                    <p className="text-sm text-stone-500">{item.email}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                      {item.papel}
                    </p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    {item.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500">
                {podeGerenciarUsuarios ? "Sem usuarios cadastrados." : "Sem acesso aos usuarios."}
              </p>
            )}
          </div>
        </Cartao>
      </div>
    </>
  );
}
