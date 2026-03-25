"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import { Alerta } from "@/components/sistema/alerta";
import { Cartao } from "@/components/sistema/cartao";
import { classeInputPadrao } from "@/components/sistema/estilos";
import { useSessaoSistema } from "@/components/sistema/provedor-sessao";
import { Button } from "@/components/ui/button";
import { chamarApi } from "@/lib/frontend/api";
import { formatarMoeda, paraInputDataHora } from "@/lib/frontend/formatadores";
import { ResumoPainel } from "@/lib/frontend/tipos";

export default function DashboardPage() {
  const { sessao } = useSessaoSistema();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [resumo, setResumo] = useState<ResumoPainel | null>(null);
  const [periodo, setPeriodo] = useState({
    inicioDe: paraInputDataHora(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).slice(0, 10),
    inicioAte: paraInputDataHora(new Date()).slice(0, 10)
  });

  const carregarResumo = useCallback(() => {
    if (!sessao) return;
    setErro(null);
    startTransition(() => {
      void chamarApi<ResumoPainel>(
        `/api/painel/resumo?idSalao=${sessao.usuario.idSalao}&inicioDe=${periodo.inicioDe}&inicioAte=${periodo.inicioAte}`
      )
        .then(setResumo)
        .catch((e) => setErro(e instanceof Error ? e.message : "Falha ao carregar painel."));
    });
  }, [periodo.inicioAte, periodo.inicioDe, sessao]);

  useEffect(() => {
    carregarResumo();
  }, [carregarResumo]);

  return (
    <>
      {erro ? <Alerta tipo="erro" texto={erro} /> : null}

      <Cartao titulo="Janela analitica">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            className={classeInputPadrao}
            type="date"
            value={periodo.inicioDe}
            onChange={(e) => setPeriodo((atual) => ({ ...atual, inicioDe: e.target.value }))}
          />
          <input
            className={classeInputPadrao}
            type="date"
            value={periodo.inicioAte}
            onChange={(e) => setPeriodo((atual) => ({ ...atual, inicioAte: e.target.value }))}
          />
          <Button disabled={pending} onClick={carregarResumo}>
            Recalcular
          </Button>
        </div>
      </Cartao>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Agendamentos", resumo?.totais.agendamentos ?? 0],
          ["Concluidos", resumo?.totais.concluidos ?? 0],
          ["Cancelados", resumo?.totais.cancelados ?? 0],
          ["Faltas", resumo?.totais.faltas ?? 0],
          ["Faturamento", formatarMoeda(resumo?.totais.faturamentoCentavos ?? 0)]
        ].map(([titulo, valor]) => (
          <Cartao key={String(titulo)} titulo={String(titulo)}>
            <p className="text-2xl font-semibold text-stone-950">{valor}</p>
          </Cartao>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Cartao titulo="Comparecimento">
          <p className="text-5xl font-semibold text-stone-950">
            {(resumo?.taxaComparecimentoPercentual ?? 0).toFixed(2)}%
          </p>
        </Cartao>
        <Cartao titulo="Profissionais mais ativos">
          <div className="space-y-3">
            {resumo?.profissionaisMaisAtivos.length ? (
              resumo.profissionaisMaisAtivos.map((item) => (
                <div key={item.idProfissional} className="flex justify-between rounded-2xl bg-stone-50 px-4 py-3">
                  <span>{item.nomeProfissional}</span>
                  <strong>{item.totalAtendimentos}</strong>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500">Sem dados no periodo.</p>
            )}
          </div>
        </Cartao>
      </div>
    </>
  );
}
