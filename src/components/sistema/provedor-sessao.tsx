"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { Sessao } from "@/lib/frontend/tipos";

const chaveSessao = "saas-salao.session";

interface ContextoSessao {
  sessao: Sessao | null;
  pronto: boolean;
  salvarSessao: (sessao: Sessao) => void;
  limparSessao: () => void;
}

const SessaoContexto = createContext<ContextoSessao | null>(null);

export function ProvedorSessao({ children }: { children: React.ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const conteudo = window.localStorage.getItem(chaveSessao);

    if (!conteudo) {
      setPronto(true);
      return;
    }

    try {
      setSessao(JSON.parse(conteudo) as Sessao);
    } catch {
      window.localStorage.removeItem(chaveSessao);
      setSessao(null);
    } finally {
      setPronto(true);
    }
  }, []);

  const valor = useMemo<ContextoSessao>(
    () => ({
      sessao,
      pronto,
      salvarSessao: (novaSessao) => {
        window.localStorage.setItem(chaveSessao, JSON.stringify(novaSessao));
        setSessao(novaSessao);
      },
      limparSessao: () => {
        window.localStorage.removeItem(chaveSessao);
        setSessao(null);
      }
    }),
    [pronto, sessao]
  );

  return <SessaoContexto.Provider value={valor}>{children}</SessaoContexto.Provider>;
}

export function useSessaoSistema() {
  const contexto = useContext(SessaoContexto);

  if (!contexto) {
    throw new Error("useSessaoSistema deve ser usado dentro de ProvedorSessao.");
  }

  return contexto;
}
