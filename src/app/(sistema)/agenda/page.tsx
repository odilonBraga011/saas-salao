"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { Alerta } from "@/components/sistema/alerta";
import { Cartao } from "@/components/sistema/cartao";
import { classeInputPadrao } from "@/components/sistema/estilos";
import { useSessaoSistema } from "@/components/sistema/provedor-sessao";
import { Button } from "@/components/ui/button";
import { chamarApi } from "@/lib/frontend/api";
import { formatarDataHora, paraInputDataHora } from "@/lib/frontend/formatadores";
import { Agendamento, Cliente, Profissional, Servico, StatusAgendamento } from "@/lib/frontend/tipos";

const statusAtualizaveis: StatusAgendamento[] = ["CONFIRMADO", "CONCLUIDO", "CANCELADO", "FALTOU"];

export default function AgendaPage() {
  const { sessao } = useSessaoSistema();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);

  const [agendamentoForm, setAgendamentoForm] = useState({
    idCliente: "",
    idProfissional: "",
    idServico: "",
    quantidade: "1",
    inicioEm: paraInputDataHora(new Date(new Date().getTime() + 60 * 60 * 1000)),
    fimEm: paraInputDataHora(new Date(new Date().getTime() + 2 * 60 * 60 * 1000)),
    observacao: ""
  });

  const [notificacaoForm, setNotificacaoForm] = useState({
    idAgendamento: "",
    canal: "WHATSAPP",
    destino: "",
    mensagem: ""
  });

  const servicoSelecionado = useMemo(
    () => servicos.find((item) => item.id === agendamentoForm.idServico),
    [agendamentoForm.idServico, servicos]
  );

  useEffect(() => {
    if (!servicoSelecionado || !agendamentoForm.inicioEm) return;
    const fim = new Date(new Date(agendamentoForm.inicioEm).getTime() + servicoSelecionado.duracaoMin * 60_000);
    setAgendamentoForm((atual) => ({ ...atual, fimEm: paraInputDataHora(fim) }));
  }, [agendamentoForm.inicioEm, servicoSelecionado]);

  const carregarDados = useCallback(() => {
    if (!sessao) return;
    setErro(null);
    startTransition(() => {
      void Promise.all([
        chamarApi<Agendamento[]>(`/api/agendamentos?idSalao=${sessao.usuario.idSalao}`),
        chamarApi<Cliente[]>(`/api/clientes?idSalao=${sessao.usuario.idSalao}`),
        chamarApi<Profissional[]>(`/api/profissionais?idSalao=${sessao.usuario.idSalao}`),
        chamarApi<Servico[]>(`/api/servicos?idSalao=${sessao.usuario.idSalao}`)
      ])
        .then(([ags, cls, prs, srs]) => {
          setAgendamentos(ags);
          setClientes(cls);
          setProfissionais(prs);
          setServicos(srs);
        })
        .catch((e) => setErro(e instanceof Error ? e.message : "Falha ao carregar agenda."));
    });
  }, [sessao]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return (
    <>
      {mensagem ? <Alerta tipo="sucesso" texto={mensagem} /> : null}
      {erro ? <Alerta tipo="erro" texto={erro} /> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Cartao titulo="Criar agendamento">
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!sessao) return;
              setErro(null);
              setMensagem(null);
              startTransition(() => {
                void chamarApi("/api/agendamentos", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    idSalao: sessao.usuario.idSalao,
                    idCliente: agendamentoForm.idCliente,
                    idProfissional: agendamentoForm.idProfissional,
                    inicioEm: new Date(agendamentoForm.inicioEm).toISOString(),
                    fimEm: new Date(agendamentoForm.fimEm).toISOString(),
                    observacao: agendamentoForm.observacao || undefined,
                    itens: agendamentoForm.idServico
                      ? [
                          {
                            idServico: agendamentoForm.idServico,
                            quantidade: Number(agendamentoForm.quantidade)
                          }
                        ]
                      : undefined
                  })
                })
                  .then(async () => {
                    setMensagem("Agendamento criado.");
                    await carregarDados();
                  })
                  .catch((err) =>
                    setErro(err instanceof Error ? err.message : "Falha ao criar agendamento.")
                  );
              });
            }}
          >
            <select
              className={classeInputPadrao}
              value={agendamentoForm.idCliente}
              onChange={(e) => setAgendamentoForm((atual) => ({ ...atual, idCliente: e.target.value }))}
            >
              <option value="">Cliente</option>
              {clientes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nomeCompleto}
                </option>
              ))}
            </select>
            <select
              className={classeInputPadrao}
              value={agendamentoForm.idProfissional}
              onChange={(e) =>
                setAgendamentoForm((atual) => ({ ...atual, idProfissional: e.target.value }))
              }
            >
              <option value="">Profissional</option>
              {profissionais.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nomeCompleto}
                </option>
              ))}
            </select>
            <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
              <select
                className={classeInputPadrao}
                value={agendamentoForm.idServico}
                onChange={(e) => setAgendamentoForm((atual) => ({ ...atual, idServico: e.target.value }))}
              >
                <option value="">Servico opcional</option>
                {servicos.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
              <input
                className={classeInputPadrao}
                type="number"
                min={1}
                value={agendamentoForm.quantidade}
                onChange={(e) => setAgendamentoForm((atual) => ({ ...atual, quantidade: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={classeInputPadrao}
                type="datetime-local"
                value={agendamentoForm.inicioEm}
                onChange={(e) => setAgendamentoForm((atual) => ({ ...atual, inicioEm: e.target.value }))}
              />
              <input
                className={classeInputPadrao}
                type="datetime-local"
                value={agendamentoForm.fimEm}
                onChange={(e) => setAgendamentoForm((atual) => ({ ...atual, fimEm: e.target.value }))}
              />
            </div>
            <textarea
              className={`${classeInputPadrao} min-h-24`}
              value={agendamentoForm.observacao}
              placeholder="Observacao"
              onChange={(e) => setAgendamentoForm((atual) => ({ ...atual, observacao: e.target.value }))}
            />
            <Button type="submit" disabled={pending}>
              Criar agendamento
            </Button>
          </form>
        </Cartao>

        <Cartao titulo="Enviar notificacao">
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!sessao) return;
              setErro(null);
              setMensagem(null);
              startTransition(() => {
                void chamarApi(`/api/agendamentos/${notificacaoForm.idAgendamento}/notificar`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    idSalao: sessao.usuario.idSalao,
                    canal: notificacaoForm.canal,
                    destino: notificacaoForm.destino,
                    mensagem: notificacaoForm.mensagem || undefined
                  })
                })
                  .then(() => setMensagem("Notificacao enviada."))
                  .catch((err) =>
                    setErro(err instanceof Error ? err.message : "Falha ao enviar notificacao.")
                  );
              });
            }}
          >
            <select
              className={classeInputPadrao}
              value={notificacaoForm.idAgendamento}
              onChange={(e) =>
                setNotificacaoForm((atual) => ({ ...atual, idAgendamento: e.target.value }))
              }
            >
              <option value="">Agendamento</option>
              {agendamentos.map((item) => (
                <option key={item.id} value={item.id}>
                  {(item.nomeCliente ?? item.idCliente) + " - " + formatarDataHora(item.inicioEm)}
                </option>
              ))}
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className={classeInputPadrao}
                value={notificacaoForm.canal}
                onChange={(e) => setNotificacaoForm((atual) => ({ ...atual, canal: e.target.value }))}
              >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="INSTAGRAM">Instagram</option>
              </select>
              <input
                className={classeInputPadrao}
                value={notificacaoForm.destino}
                placeholder="Destino"
                onChange={(e) => setNotificacaoForm((atual) => ({ ...atual, destino: e.target.value }))}
              />
            </div>
            <textarea
              className={`${classeInputPadrao} min-h-24`}
              value={notificacaoForm.mensagem}
              placeholder="Mensagem"
              onChange={(e) => setNotificacaoForm((atual) => ({ ...atual, mensagem: e.target.value }))}
            />
            <Button type="submit" disabled={pending}>
              Enviar
            </Button>
          </form>
        </Cartao>
      </div>

      <Cartao titulo="Agenda operacional">
        <div className="space-y-4">
          {agendamentos.length ? (
            agendamentos.map((item) => (
              <div key={item.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-stone-900">
                      {(item.nomeCliente ?? item.idCliente) + " - " + (item.nomeProfissional ?? item.idProfissional)}
                    </p>
                    <p className="text-sm text-stone-500">{formatarDataHora(item.inicioEm) + " - " + item.status}</p>
                    {item.itens?.length ? (
                      <p className="mt-1 text-sm text-stone-600">
                        {item.itens
                          .map((servico) => `${servico.nomeServico ?? servico.idServico} (${servico.quantidade}x)`)
                          .join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statusAtualizaveis.map((status) => (
                      <Button
                        key={status}
                        disabled={pending || item.status === status}
                        variant={status === "CONCLUIDO" ? "default" : "outline"}
                        onClick={() => {
                          if (!sessao) return;
                          setErro(null);
                          setMensagem(null);
                          startTransition(() => {
                            void chamarApi(`/api/agendamentos/${item.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ idSalao: sessao.usuario.idSalao, status })
                            })
                              .then(async () => {
                                setMensagem(`Agendamento atualizado para ${status.toLowerCase()}.`);
                                await carregarDados();
                              })
                              .catch((err) =>
                                setErro(
                                  err instanceof Error
                                    ? err.message
                                    : "Falha ao atualizar status do agendamento."
                                )
                              );
                          });
                        }}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-stone-500">Nenhum agendamento encontrado.</p>
          )}
        </div>
      </Cartao>
    </>
  );
}
