"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import { Alerta } from "@/components/sistema/alerta";
import { Cartao } from "@/components/sistema/cartao";
import { classeInputPadrao } from "@/components/sistema/estilos";
import { useSessaoSistema } from "@/components/sistema/provedor-sessao";
import { Button } from "@/components/ui/button";
import { chamarApi } from "@/lib/frontend/api";
import { formatarDataHora, formatarMoeda } from "@/lib/frontend/formatadores";
import { Cliente, HistoricoCliente } from "@/lib/frontend/tipos";

export default function HistoricoPage() {
  const { sessao } = useSessaoSistema();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [idClienteSelecionado, setIdClienteSelecionado] = useState("");
  const [historico, setHistorico] = useState<HistoricoCliente | null>(null);

  const carregarClientes = useCallback(() => {
    if (!sessao) return;
    setErro(null);
    startTransition(() => {
      void chamarApi<Cliente[]>(`/api/clientes?idSalao=${sessao.usuario.idSalao}`)
        .then(setClientes)
        .catch((e) => setErro(e instanceof Error ? e.message : "Falha ao carregar clientes."));
    });
  }, [sessao]);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  return (
    <>
      {mensagem ? <Alerta tipo="sucesso" texto={mensagem} /> : null}
      {erro ? <Alerta tipo="erro" texto={erro} /> : null}

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Cartao titulo="Consulta de cliente">
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!sessao || !idClienteSelecionado) return;
              setErro(null);
              setMensagem(null);
              startTransition(() => {
                void chamarApi<HistoricoCliente>(
                  `/api/clientes/${idClienteSelecionado}/historico?idSalao=${sessao.usuario.idSalao}`
                )
                  .then((dados) => {
                    setHistorico(dados);
                    setMensagem("Historico carregado.");
                  })
                  .catch((err) =>
                    setErro(err instanceof Error ? err.message : "Falha ao carregar historico.")
                  );
              });
            }}
          >
            <select
              className={classeInputPadrao}
              value={idClienteSelecionado}
              onChange={(e) => setIdClienteSelecionado(e.target.value)}
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nomeCompleto}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={pending}>
              Carregar historico
            </Button>
          </form>
        </Cartao>

        <Cartao titulo="Resumo de relacionamento">
          {historico ? (
            <div className="space-y-4">
              <div className="rounded-3xl bg-stone-950 p-5 text-stone-50">
                <p className="text-3xl font-semibold">{historico.nomeCliente}</p>
                <p className="mt-2 text-sm text-stone-400">
                  Total: {historico.totalAtendimentos} - Ultimo:{" "}
                  {formatarDataHora(historico.ultimoAtendimentoEm)}
                </p>
              </div>
              <div className="space-y-3">
                {historico.servicos.length ? (
                  historico.servicos.map((item) => (
                    <div key={item.idServico} className="rounded-2xl bg-stone-50 px-4 py-3">
                      <p className="font-medium text-stone-900">{item.nomeServico}</p>
                      <p className="text-sm text-stone-500">
                        {item.quantidade} recorrencias - {formatarMoeda(item.valorTotalCentavos)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-stone-500">Sem historico de servicos concluidos.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-stone-500">Selecione um cliente para abrir o historico.</p>
          )}
        </Cartao>
      </div>
    </>
  );
}
