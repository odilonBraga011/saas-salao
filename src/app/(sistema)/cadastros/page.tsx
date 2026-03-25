"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import { Alerta } from "@/components/sistema/alerta";
import { Cartao } from "@/components/sistema/cartao";
import { classeInputPadrao } from "@/components/sistema/estilos";
import { useSessaoSistema } from "@/components/sistema/provedor-sessao";
import { Button } from "@/components/ui/button";
import { chamarApi } from "@/lib/frontend/api";
import { formatarMoeda } from "@/lib/frontend/formatadores";
import { Cliente, Profissional, Servico } from "@/lib/frontend/tipos";

export default function CadastrosPage() {
  const { sessao } = useSessaoSistema();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);

  const [clienteForm, setClienteForm] = useState({ nomeCompleto: "", telefone: "", email: "" });
  const [profissionalForm, setProfissionalForm] = useState({
    nomeCompleto: "",
    especialidade: "",
    comissaoPercentual: ""
  });
  const [servicoForm, setServicoForm] = useState({ nome: "", duracaoMin: "60", precoBaseCentavos: "9000" });

  const carregarDados = useCallback(() => {
    if (!sessao) return;
    setErro(null);
    startTransition(() => {
      void Promise.all([
        chamarApi<Cliente[]>(`/api/clientes?idSalao=${sessao.usuario.idSalao}`),
        chamarApi<Profissional[]>(`/api/profissionais?idSalao=${sessao.usuario.idSalao}`),
        chamarApi<Servico[]>(`/api/servicos?idSalao=${sessao.usuario.idSalao}`)
      ])
        .then(([cls, prs, srs]) => {
          setClientes(cls);
          setProfissionais(prs);
          setServicos(srs);
        })
        .catch((e) => setErro(e instanceof Error ? e.message : "Falha ao carregar cadastros."));
    });
  }, [sessao]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return (
    <>
      {mensagem ? <Alerta tipo="sucesso" texto={mensagem} /> : null}
      {erro ? <Alerta tipo="erro" texto={erro} /> : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <Cartao titulo="Clientes">
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!sessao) return;
              setErro(null);
              setMensagem(null);
              startTransition(() => {
                void chamarApi("/api/clientes", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ idSalao: sessao.usuario.idSalao, ...clienteForm })
                })
                  .then(async () => {
                    setClienteForm({ nomeCompleto: "", telefone: "", email: "" });
                    setMensagem("Cliente cadastrado.");
                    await carregarDados();
                  })
                  .catch((err) =>
                    setErro(err instanceof Error ? err.message : "Falha ao cadastrar cliente.")
                  );
              });
            }}
          >
            <input
              className={classeInputPadrao}
              placeholder="Nome"
              value={clienteForm.nomeCompleto}
              onChange={(e) => setClienteForm((atual) => ({ ...atual, nomeCompleto: e.target.value }))}
            />
            <input
              className={classeInputPadrao}
              placeholder="Telefone"
              value={clienteForm.telefone}
              onChange={(e) => setClienteForm((atual) => ({ ...atual, telefone: e.target.value }))}
            />
            <input
              className={classeInputPadrao}
              placeholder="Email"
              value={clienteForm.email}
              onChange={(e) => setClienteForm((atual) => ({ ...atual, email: e.target.value }))}
            />
            <Button type="submit" disabled={pending}>
              Salvar cliente
            </Button>
          </form>
        </Cartao>

        <Cartao titulo="Profissionais">
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!sessao) return;
              setErro(null);
              setMensagem(null);
              startTransition(() => {
                void chamarApi("/api/profissionais", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    idSalao: sessao.usuario.idSalao,
                    nomeCompleto: profissionalForm.nomeCompleto,
                    especialidade: profissionalForm.especialidade || undefined,
                    comissaoPercentual: profissionalForm.comissaoPercentual
                      ? Number(profissionalForm.comissaoPercentual)
                      : undefined
                  })
                })
                  .then(async () => {
                    setProfissionalForm({ nomeCompleto: "", especialidade: "", comissaoPercentual: "" });
                    setMensagem("Profissional cadastrado.");
                    await carregarDados();
                  })
                  .catch((err) =>
                    setErro(err instanceof Error ? err.message : "Falha ao cadastrar profissional.")
                  );
              });
            }}
          >
            <input
              className={classeInputPadrao}
              placeholder="Nome"
              value={profissionalForm.nomeCompleto}
              onChange={(e) =>
                setProfissionalForm((atual) => ({ ...atual, nomeCompleto: e.target.value }))
              }
            />
            <input
              className={classeInputPadrao}
              placeholder="Especialidade"
              value={profissionalForm.especialidade}
              onChange={(e) =>
                setProfissionalForm((atual) => ({ ...atual, especialidade: e.target.value }))
              }
            />
            <input
              className={classeInputPadrao}
              type="number"
              placeholder="Comissao"
              value={profissionalForm.comissaoPercentual}
              onChange={(e) =>
                setProfissionalForm((atual) => ({ ...atual, comissaoPercentual: e.target.value }))
              }
            />
            <Button type="submit" disabled={pending}>
              Salvar profissional
            </Button>
          </form>
        </Cartao>

        <Cartao titulo="Servicos">
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!sessao) return;
              setErro(null);
              setMensagem(null);
              startTransition(() => {
                void chamarApi("/api/servicos", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    idSalao: sessao.usuario.idSalao,
                    nome: servicoForm.nome,
                    duracaoMin: Number(servicoForm.duracaoMin),
                    precoBaseCentavos: Number(servicoForm.precoBaseCentavos)
                  })
                })
                  .then(async () => {
                    setServicoForm({ nome: "", duracaoMin: "60", precoBaseCentavos: "9000" });
                    setMensagem("Servico cadastrado.");
                    await carregarDados();
                  })
                  .catch((err) =>
                    setErro(err instanceof Error ? err.message : "Falha ao cadastrar servico.")
                  );
              });
            }}
          >
            <input
              className={classeInputPadrao}
              placeholder="Nome"
              value={servicoForm.nome}
              onChange={(e) => setServicoForm((atual) => ({ ...atual, nome: e.target.value }))}
            />
            <input
              className={classeInputPadrao}
              type="number"
              placeholder="Duracao"
              value={servicoForm.duracaoMin}
              onChange={(e) => setServicoForm((atual) => ({ ...atual, duracaoMin: e.target.value }))}
            />
            <input
              className={classeInputPadrao}
              type="number"
              placeholder="Preco em centavos"
              value={servicoForm.precoBaseCentavos}
              onChange={(e) =>
                setServicoForm((atual) => ({ ...atual, precoBaseCentavos: e.target.value }))
              }
            />
            <Button type="submit" disabled={pending}>
              Salvar servico
            </Button>
          </form>
        </Cartao>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Cartao titulo="Carteira de clientes">
          <div className="space-y-3">
            {clientes.length ? (
              clientes.map((item) => (
                <div key={item.id} className="rounded-2xl bg-stone-50 px-4 py-3">
                  <p className="font-medium text-stone-900">{item.nomeCompleto}</p>
                  <p className="text-sm text-stone-500">{item.telefone}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500">Sem clientes.</p>
            )}
          </div>
        </Cartao>

        <Cartao titulo="Equipe">
          <div className="space-y-3">
            {profissionais.length ? (
              profissionais.map((item) => (
                <div key={item.id} className="rounded-2xl bg-stone-50 px-4 py-3">
                  <p className="font-medium text-stone-900">{item.nomeCompleto}</p>
                  <p className="text-sm text-stone-500">{item.especialidade ?? "Sem especialidade"}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500">Sem profissionais.</p>
            )}
          </div>
        </Cartao>

        <Cartao titulo="Catalogo de servicos">
          <div className="space-y-3">
            {servicos.length ? (
              servicos.map((item) => (
                <div key={item.id} className="rounded-2xl bg-stone-50 px-4 py-3">
                  <p className="font-medium text-stone-900">{item.nome}</p>
                  <p className="text-sm text-stone-500">
                    {item.duracaoMin} min - {formatarMoeda(item.precoBaseCentavos)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500">Sem servicos.</p>
            )}
          </div>
        </Cartao>
      </div>
    </>
  );
}
