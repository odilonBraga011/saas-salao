"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CalendarDays, ChartColumnIncreasing, LogOut, ShieldCheck, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { canAccess } from "@/infrastructure/auth/rbac";

type Aba = "dashboard" | "agenda" | "cadastros" | "usuarios" | "historico";
type Sessao = { token: string; usuario: { id: string; idSalao: string; nomeCompleto: string; email: string; papel: string } };
type Resumo = {
  totais: { agendamentos: number; concluidos: number; cancelados: number; faltas: number; faturamentoCentavos: number };
  taxaComparecimentoPercentual: number;
  profissionaisMaisAtivos: Array<{ idProfissional: string; nomeProfissional: string; totalAtendimentos: number }>;
  servicosMaisVendidos: Array<{ idServico: string; nomeServico: string; quantidade: number; faturamentoCentavos: number }>;
};
type Cliente = { id: string; nomeCompleto: string; telefone: string; email?: string | null };
type Profissional = { id: string; nomeCompleto: string; especialidade?: string | null; comissaoPercentual?: number | null };
type Servico = { id: string; nome: string; duracaoMin: number; precoBaseCentavos: number };
type Usuario = { id: string; nomeCompleto: string; email: string; status: string };
type Agendamento = {
  id: string;
  idCliente: string;
  idProfissional: string;
  nomeCliente?: string;
  nomeProfissional?: string;
  inicioEm: string;
  fimEm: string;
  status: "AGENDADO" | "CONFIRMADO" | "CONCLUIDO" | "CANCELADO" | "FALTOU";
  observacao?: string | null;
  itens?: Array<{ idServico: string; nomeServico?: string; quantidade: number; precoUnitarioCentavos: number }>;
};
type Historico = {
  nomeCliente: string;
  totalAtendimentos: number;
  ultimoAtendimentoEm?: string;
  servicos: Array<{ idServico: string; nomeServico: string; quantidade: number; valorTotalCentavos: number }>;
};

const chaveSessao = "saas-salao.session";
const abas: Aba[] = ["dashboard", "agenda", "cadastros", "usuarios", "historico"];
const classeInput =
  "w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none focus:border-amber-500 focus:bg-white";

function moeda(valorCentavos: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valorCentavos / 100);
}

function dataHora(valor?: string) {
  return valor
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(valor))
    : "-";
}

function localInput(data: Date) {
  return new Date(data.getTime() - data.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(url, init);
  const corpo = (await resposta.json().catch(() => ({}))) as { dados?: T; erro?: string };
  if (!resposta.ok) throw new Error(corpo.erro ?? "Falha na requisicao.");
  return (corpo.dados ?? corpo) as T;
}

function Card({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border border-stone-200 bg-white/85 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
      <h2 className="mb-4 text-lg font-semibold text-stone-900">{titulo}</h2>
      {children}
    </section>
  );
}

export default function HomePage() {
  const agora = new Date();
  const [aba, setAba] = useState<Aba>("dashboard");
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [carregado, setCarregado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [historico, setHistorico] = useState<Historico | null>(null);

  const [setupForm, setSetupForm] = useState({ nomeSalao: "Salao Exemplo", slugSalao: "salao-exemplo", nomeProprietario: "Ana Souza", emailProprietario: "ana@salao.com", senhaProprietario: "SenhaForte123" });
  const [loginForm, setLoginForm] = useState({ slugSalao: "salao-exemplo", email: "ana@salao.com", senha: "SenhaForte123" });
  const [clienteForm, setClienteForm] = useState({ nomeCompleto: "", telefone: "", email: "" });
  const [profissionalForm, setProfissionalForm] = useState({ nomeCompleto: "", especialidade: "", comissaoPercentual: "" });
  const [servicoForm, setServicoForm] = useState({ nome: "", duracaoMin: "60", precoBaseCentavos: "9000" });
  const [usuarioForm, setUsuarioForm] = useState({ nomeCompleto: "", email: "", senha: "" });
  const [historicoClienteId, setHistoricoClienteId] = useState("");
  const [notificacao, setNotificacao] = useState({ idAgendamento: "", canal: "WHATSAPP", destino: "", mensagem: "" });
  const [agendamentoForm, setAgendamentoForm] = useState({
    idCliente: "",
    idProfissional: "",
    idServico: "",
    quantidade: "1",
    inicioEm: localInput(new Date(agora.getTime() + 60 * 60 * 1000)),
    fimEm: localInput(new Date(agora.getTime() + 2 * 60 * 60 * 1000)),
    observacao: ""
  });
  const [periodo, setPeriodo] = useState({ inicioDe: localInput(new Date(agora.getFullYear(), agora.getMonth(), 1)).slice(0, 10), inicioAte: localInput(agora).slice(0, 10) });

  const podeGerenciarUsuarios = useMemo(() => (sessao ? canAccess(sessao.usuario.papel, "usuarios.gerenciar") : false), [sessao]);
  const servicoSelecionado = useMemo(() => servicos.find((item) => item.id === agendamentoForm.idServico), [servicos, agendamentoForm.idServico]);

  useEffect(() => {
    const salvo = window.localStorage.getItem(chaveSessao);
    if (salvo) {
      try {
        setSessao(JSON.parse(salvo) as Sessao);
      } catch {
        window.localStorage.removeItem(chaveSessao);
      }
    }
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!servicoSelecionado || !agendamentoForm.inicioEm) return;
    const fim = new Date(new Date(agendamentoForm.inicioEm).getTime() + servicoSelecionado.duracaoMin * 60_000);
    setAgendamentoForm((atual) => ({ ...atual, fimEm: localInput(fim) }));
  }, [servicoSelecionado, agendamentoForm.inicioEm]);

  useEffect(() => {
    if (sessao) void carregarWorkspace(sessao);
  }, [sessao]);

  async function carregarWorkspace(sessaoAtual = sessao) {
    if (!sessaoAtual) return;
    const idSalao = sessaoAtual.usuario.idSalao;
    const gerenciaUsuarios = canAccess(sessaoAtual.usuario.papel, "usuarios.gerenciar");
    const [resumoAtual, ags, cls, prs, srs] = await Promise.all([
      api<Resumo>(`/api/painel/resumo?idSalao=${idSalao}&inicioDe=${periodo.inicioDe}&inicioAte=${periodo.inicioAte}`),
      api<Agendamento[]>(`/api/agendamentos?idSalao=${idSalao}`),
      api<Cliente[]>(`/api/clientes?idSalao=${idSalao}`),
      api<Profissional[]>(`/api/profissionais?idSalao=${idSalao}`),
      api<Servico[]>(`/api/servicos?idSalao=${idSalao}`)
    ]);
    setResumo(resumoAtual);
    setAgendamentos(ags);
    setClientes(cls);
    setProfissionais(prs);
    setServicos(srs);
    setUsuarios(
      gerenciaUsuarios
        ? await api<Usuario[]>(`/api/usuarios?idSalao=${idSalao}`, { headers: { "x-papel-usuario": sessaoAtual.usuario.papel } })
        : []
    );
  }

  function executar(execucao: () => Promise<void>, sucesso: string) {
    setErro(null);
    setMensagem(null);
    startTransition(() => {
      void execucao()
        .then(() => setMensagem(sucesso))
        .catch((err) => setErro(err instanceof Error ? err.message : "Falha na operacao."));
    });
  }

  if (!carregado) return <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">Carregando...</main>;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-6 sm:px-8">
      <section className="rounded-[36px] border border-amber-200 bg-[linear-gradient(135deg,rgba(255,245,229,0.96),rgba(255,255,255,0.95))] p-8 shadow-[0_28px_90px_rgba(64,33,12,0.12)]">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700"><Sparkles className="h-4 w-4" />Workspace operacional</div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-stone-950 sm:text-5xl">O app agora cobre setup, agenda, cadastros, usuarios e historico.</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-700">A estrutura de dominio ja existia. Esta tela conecta os modulos e transforma a base em uma operacao utilizavel.</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[{ titulo: "Agenda viva", texto: "Criacao, confirmacao e conclusao.", icone: CalendarDays }, { titulo: "Painel real", texto: "Faturamento, faltas e comparecimento.", icone: ChartColumnIncreasing }, { titulo: "RBAC", texto: "Equipe interna conforme o papel.", icone: ShieldCheck }].map(({ titulo, texto, icone: Icone }) => (
                <div key={titulo} className="rounded-3xl border border-white bg-white/80 p-4"><Icone className="mb-3 h-5 w-5 text-amber-700" /><p className="text-sm font-semibold text-stone-900">{titulo}</p><p className="mt-1 text-sm text-stone-600">{texto}</p></div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {mensagem ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{mensagem}</div> : null}
            {erro ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{erro}</div> : null}
            {!sessao ? (
              <>
                <Card titulo="Setup inicial">
                  <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); executar(() => api("/api/setup/inicial", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(setupForm) }).then(() => undefined), "Sistema inicializado."); }}>
                    {(["nomeSalao", "slugSalao", "nomeProprietario", "emailProprietario", "senhaProprietario"] as const).map((campo) => (
                      <input key={campo} className={classeInput} type={campo.includes("senha") ? "password" : campo.includes("email") ? "email" : "text"} value={setupForm[campo]} onChange={(e) => setSetupForm((a) => ({ ...a, [campo]: e.target.value }))} placeholder={campo} />
                    ))}
                    <Button disabled={pending} type="submit">Criar estrutura inicial</Button>
                  </form>
                </Card>
                <Card titulo="Login operacional">
                  <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); executar(async () => { const autenticacao = await api<Sessao>("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(loginForm) }); window.localStorage.setItem(chaveSessao, JSON.stringify(autenticacao)); setSessao(autenticacao); }, "Login concluido."); }}>
                    {(["slugSalao", "email", "senha"] as const).map((campo) => (
                      <input key={campo} className={classeInput} type={campo === "senha" ? "password" : campo === "email" ? "email" : "text"} value={loginForm[campo]} onChange={(e) => setLoginForm((a) => ({ ...a, [campo]: e.target.value }))} placeholder={campo} />
                    ))}
                    <Button disabled={pending} type="submit">Entrar</Button>
                  </form>
                </Card>
              </>
            ) : (
              <Card titulo="Sessao ativa">
                <div className="space-y-4">
                  <div className="rounded-3xl bg-stone-950 p-5 text-stone-100">
                    <p className="text-lg font-semibold">{sessao.usuario.nomeCompleto}</p>
                    <p className="text-sm text-stone-400">{sessao.usuario.email} - {sessao.usuario.papel}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button disabled={pending} onClick={() => void carregarWorkspace()}>Atualizar dados</Button>
                    <Button variant="outline" onClick={() => { window.localStorage.removeItem(chaveSessao); setSessao(null); setHistorico(null); }}><LogOut className="mr-2 h-4 w-4" />Sair</Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

      {sessao ? (
        <div className="mt-8 grid gap-6 xl:grid-cols-[240px_1fr]">
          <aside className="rounded-[30px] border border-stone-200 bg-white/80 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <nav className="grid gap-2">{abas.map((item) => <button key={item} className={aba === item ? "rounded-3xl border border-amber-300 bg-amber-50 px-4 py-4 text-left font-semibold text-stone-900" : "rounded-3xl px-4 py-4 text-left text-stone-600 hover:bg-stone-50"} onClick={() => setAba(item)} type="button">{item}</button>)}</nav>
          </aside>
          <section className="space-y-6">
            {aba === "dashboard" ? (
              <>
                <Card titulo="Janela analitica"><div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"><input className={classeInput} type="date" value={periodo.inicioDe} onChange={(e) => setPeriodo((a) => ({ ...a, inicioDe: e.target.value }))} /><input className={classeInput} type="date" value={periodo.inicioAte} onChange={(e) => setPeriodo((a) => ({ ...a, inicioAte: e.target.value }))} /><Button disabled={pending} onClick={() => void carregarWorkspace()}>Recalcular painel</Button></div></Card>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{[["Agendamentos", resumo?.totais.agendamentos ?? 0], ["Concluidos", resumo?.totais.concluidos ?? 0], ["Cancelados", resumo?.totais.cancelados ?? 0], ["Faltas", resumo?.totais.faltas ?? 0], ["Faturamento", moeda(resumo?.totais.faturamentoCentavos ?? 0)]].map(([titulo, valor]) => <Card key={String(titulo)} titulo={String(titulo)}><p className="text-2xl font-semibold text-stone-950">{valor}</p></Card>)}</div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card titulo="Comparecimento"><p className="text-5xl font-semibold text-stone-950">{(resumo?.taxaComparecimentoPercentual ?? 0).toFixed(2)}%</p></Card>
                  <Card titulo="Profissionais mais ativos"><div className="space-y-3">{resumo?.profissionaisMaisAtivos.length ? resumo.profissionaisMaisAtivos.map((item) => <div key={item.idProfissional} className="flex justify-between rounded-2xl bg-stone-50 px-4 py-3"><span>{item.nomeProfissional}</span><strong>{item.totalAtendimentos}</strong></div>) : <p className="text-sm text-stone-500">Sem dados no periodo.</p>}</div></Card>
                </div>
              </>
            ) : null}

            {aba === "agenda" ? (
              <>
                <div className="grid gap-6 xl:grid-cols-2">
                  <Card titulo="Criar agendamento">
                    <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); executar(async () => { if (!sessao) return; await api("/api/agendamentos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idSalao: sessao.usuario.idSalao, idCliente: agendamentoForm.idCliente, idProfissional: agendamentoForm.idProfissional, inicioEm: new Date(agendamentoForm.inicioEm).toISOString(), fimEm: new Date(agendamentoForm.fimEm).toISOString(), observacao: agendamentoForm.observacao || undefined, itens: agendamentoForm.idServico ? [{ idServico: agendamentoForm.idServico, quantidade: Number(agendamentoForm.quantidade) }] : undefined }) }); await carregarWorkspace(); }, "Agendamento criado."); }}>
                      <select className={classeInput} value={agendamentoForm.idCliente} onChange={(e) => setAgendamentoForm((a) => ({ ...a, idCliente: e.target.value }))}><option value="">Cliente</option>{clientes.map((item) => <option key={item.id} value={item.id}>{item.nomeCompleto}</option>)}</select>
                      <select className={classeInput} value={agendamentoForm.idProfissional} onChange={(e) => setAgendamentoForm((a) => ({ ...a, idProfissional: e.target.value }))}><option value="">Profissional</option>{profissionais.map((item) => <option key={item.id} value={item.id}>{item.nomeCompleto}</option>)}</select>
                      <div className="grid gap-3 sm:grid-cols-[1fr_140px]"><select className={classeInput} value={agendamentoForm.idServico} onChange={(e) => setAgendamentoForm((a) => ({ ...a, idServico: e.target.value }))}><option value="">Servico opcional</option>{servicos.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select><input className={classeInput} type="number" min={1} value={agendamentoForm.quantidade} onChange={(e) => setAgendamentoForm((a) => ({ ...a, quantidade: e.target.value }))} /></div>
                      <div className="grid gap-3 sm:grid-cols-2"><input className={classeInput} type="datetime-local" value={agendamentoForm.inicioEm} onChange={(e) => setAgendamentoForm((a) => ({ ...a, inicioEm: e.target.value }))} /><input className={classeInput} type="datetime-local" value={agendamentoForm.fimEm} onChange={(e) => setAgendamentoForm((a) => ({ ...a, fimEm: e.target.value }))} /></div>
                      <textarea className={`${classeInput} min-h-24`} value={agendamentoForm.observacao} onChange={(e) => setAgendamentoForm((a) => ({ ...a, observacao: e.target.value }))} placeholder="Observacao" />
                      <Button disabled={pending} type="submit">Criar agendamento</Button>
                    </form>
                  </Card>
                  <Card titulo="Enviar notificacao">
                    <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); executar(async () => { if (!sessao) return; await api(`/api/agendamentos/${notificacao.idAgendamento}/notificar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idSalao: sessao.usuario.idSalao, canal: notificacao.canal, destino: notificacao.destino, mensagem: notificacao.mensagem || undefined }) }); }, "Notificacao enviada."); }}>
                      <select className={classeInput} value={notificacao.idAgendamento} onChange={(e) => setNotificacao((a) => ({ ...a, idAgendamento: e.target.value }))}><option value="">Agendamento</option>{agendamentos.map((item) => <option key={item.id} value={item.id}>{item.nomeCliente ?? item.idCliente} - {dataHora(item.inicioEm)}</option>)}</select>
                      <div className="grid gap-3 sm:grid-cols-2"><select className={classeInput} value={notificacao.canal} onChange={(e) => setNotificacao((a) => ({ ...a, canal: e.target.value }))}><option value="WHATSAPP">WhatsApp</option><option value="INSTAGRAM">Instagram</option></select><input className={classeInput} value={notificacao.destino} onChange={(e) => setNotificacao((a) => ({ ...a, destino: e.target.value }))} placeholder="Destino" /></div>
                      <textarea className={`${classeInput} min-h-24`} value={notificacao.mensagem} onChange={(e) => setNotificacao((a) => ({ ...a, mensagem: e.target.value }))} placeholder="Mensagem" />
                      <Button disabled={pending} type="submit">Enviar</Button>
                    </form>
                  </Card>
                </div>
                <Card titulo="Agenda operacional">
                  <div className="space-y-4">{agendamentos.length ? agendamentos.map((item) => <div key={item.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><p className="font-semibold text-stone-900">{item.nomeCliente ?? item.idCliente} - {item.nomeProfissional ?? item.idProfissional}</p><p className="text-sm text-stone-500">{dataHora(item.inicioEm)} - {item.status}</p>{item.itens?.length ? <p className="mt-1 text-sm text-stone-600">{item.itens.map((servico) => `${servico.nomeServico ?? servico.idServico} (${servico.quantidade}x)`).join(", ")}</p> : null}</div><div className="flex flex-wrap gap-2">{["CONFIRMADO", "CONCLUIDO", "CANCELADO", "FALTOU"].map((status) => <Button key={status} disabled={pending || item.status === status} variant={status === "CONCLUIDO" ? "default" : "outline"} onClick={() => executar(async () => { if (!sessao) return; await api(`/api/agendamentos/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idSalao: sessao.usuario.idSalao, status }) }); await carregarWorkspace(); }, `Agendamento atualizado para ${status.toLowerCase()}.`)}>{status}</Button>)}</div></div></div>) : <p className="text-sm text-stone-500">Nenhum agendamento encontrado.</p>}</div>
                </Card>
              </>
            ) : null}

            {aba === "cadastros" ? (
              <>
                <div className="grid gap-6 xl:grid-cols-3">
                  <Card titulo="Clientes"><form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); executar(async () => { if (!sessao) return; await api("/api/clientes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idSalao: sessao.usuario.idSalao, ...clienteForm }) }); setClienteForm({ nomeCompleto: "", telefone: "", email: "" }); await carregarWorkspace(); }, "Cliente cadastrado."); }}><input className={classeInput} value={clienteForm.nomeCompleto} onChange={(e) => setClienteForm((a) => ({ ...a, nomeCompleto: e.target.value }))} placeholder="Nome" /><input className={classeInput} value={clienteForm.telefone} onChange={(e) => setClienteForm((a) => ({ ...a, telefone: e.target.value }))} placeholder="Telefone" /><input className={classeInput} value={clienteForm.email} onChange={(e) => setClienteForm((a) => ({ ...a, email: e.target.value }))} placeholder="Email" /><Button disabled={pending} type="submit">Salvar cliente</Button></form></Card>
                  <Card titulo="Profissionais"><form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); executar(async () => { if (!sessao) return; await api("/api/profissionais", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idSalao: sessao.usuario.idSalao, nomeCompleto: profissionalForm.nomeCompleto, especialidade: profissionalForm.especialidade || undefined, comissaoPercentual: profissionalForm.comissaoPercentual ? Number(profissionalForm.comissaoPercentual) : undefined }) }); setProfissionalForm({ nomeCompleto: "", especialidade: "", comissaoPercentual: "" }); await carregarWorkspace(); }, "Profissional cadastrado."); }}><input className={classeInput} value={profissionalForm.nomeCompleto} onChange={(e) => setProfissionalForm((a) => ({ ...a, nomeCompleto: e.target.value }))} placeholder="Nome" /><input className={classeInput} value={profissionalForm.especialidade} onChange={(e) => setProfissionalForm((a) => ({ ...a, especialidade: e.target.value }))} placeholder="Especialidade" /><input className={classeInput} type="number" value={profissionalForm.comissaoPercentual} onChange={(e) => setProfissionalForm((a) => ({ ...a, comissaoPercentual: e.target.value }))} placeholder="Comissao" /><Button disabled={pending} type="submit">Salvar profissional</Button></form></Card>
                  <Card titulo="Servicos"><form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); executar(async () => { if (!sessao) return; await api("/api/servicos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idSalao: sessao.usuario.idSalao, nome: servicoForm.nome, duracaoMin: Number(servicoForm.duracaoMin), precoBaseCentavos: Number(servicoForm.precoBaseCentavos) }) }); setServicoForm({ nome: "", duracaoMin: "60", precoBaseCentavos: "9000" }); await carregarWorkspace(); }, "Servico cadastrado."); }}><input className={classeInput} value={servicoForm.nome} onChange={(e) => setServicoForm((a) => ({ ...a, nome: e.target.value }))} placeholder="Nome" /><input className={classeInput} type="number" value={servicoForm.duracaoMin} onChange={(e) => setServicoForm((a) => ({ ...a, duracaoMin: e.target.value }))} placeholder="Duracao" /><input className={classeInput} type="number" value={servicoForm.precoBaseCentavos} onChange={(e) => setServicoForm((a) => ({ ...a, precoBaseCentavos: e.target.value }))} placeholder="Preco em centavos" /><Button disabled={pending} type="submit">Salvar servico</Button></form></Card>
                </div>
                <div className="grid gap-6 xl:grid-cols-3">
                  <Card titulo="Carteira de clientes"><div className="space-y-3">{clientes.length ? clientes.map((item) => <div key={item.id} className="rounded-2xl bg-stone-50 px-4 py-3"><p className="font-medium text-stone-900">{item.nomeCompleto}</p><p className="text-sm text-stone-500">{item.telefone}</p></div>) : <p className="text-sm text-stone-500">Sem clientes.</p>}</div></Card>
                  <Card titulo="Equipe"><div className="space-y-3">{profissionais.length ? profissionais.map((item) => <div key={item.id} className="rounded-2xl bg-stone-50 px-4 py-3"><p className="font-medium text-stone-900">{item.nomeCompleto}</p><p className="text-sm text-stone-500">{item.especialidade ?? "Sem especialidade"}</p></div>) : <p className="text-sm text-stone-500">Sem profissionais.</p>}</div></Card>
                  <Card titulo="Catalogo de servicos"><div className="space-y-3">{servicos.length ? servicos.map((item) => <div key={item.id} className="rounded-2xl bg-stone-50 px-4 py-3"><p className="font-medium text-stone-900">{item.nome}</p><p className="text-sm text-stone-500">{item.duracaoMin} min - {moeda(item.precoBaseCentavos)}</p></div>) : <p className="text-sm text-stone-500">Sem servicos.</p>}</div></Card>
                </div>
              </>
            ) : null}

            {aba === "usuarios" ? (
              <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <Card titulo="Novo usuario interno">
                  {podeGerenciarUsuarios ? <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); executar(async () => { if (!sessao) return; await api("/api/usuarios", { method: "POST", headers: { "Content-Type": "application/json", "x-papel-usuario": sessao.usuario.papel }, body: JSON.stringify({ idSalao: sessao.usuario.idSalao, ...usuarioForm }) }); setUsuarioForm({ nomeCompleto: "", email: "", senha: "" }); await carregarWorkspace(); }, "Usuario criado."); }}><input className={classeInput} value={usuarioForm.nomeCompleto} onChange={(e) => setUsuarioForm((a) => ({ ...a, nomeCompleto: e.target.value }))} placeholder="Nome" /><input className={classeInput} type="email" value={usuarioForm.email} onChange={(e) => setUsuarioForm((a) => ({ ...a, email: e.target.value }))} placeholder="Email" /><input className={classeInput} type="password" value={usuarioForm.senha} onChange={(e) => setUsuarioForm((a) => ({ ...a, senha: e.target.value }))} placeholder="Senha" /><Button disabled={pending} type="submit">Criar usuario</Button></form> : <p className="text-sm text-stone-500">O papel atual nao pode criar usuarios.</p>}
                </Card>
                <Card titulo="Equipe interna"><div className="space-y-3">{usuarios.length ? usuarios.map((item) => <div key={item.id} className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3"><div><p className="font-medium text-stone-900">{item.nomeCompleto}</p><p className="text-sm text-stone-500">{item.email}</p></div><span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{item.status}</span></div>) : <p className="text-sm text-stone-500">{podeGerenciarUsuarios ? "Sem usuarios." : "Sem acesso aos usuarios."}</p>}</div></Card>
              </div>
            ) : null}

            {aba === "historico" ? (
              <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                <Card titulo="Consulta de cliente"><form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); executar(async () => { if (!sessao || !historicoClienteId) return; setHistorico(await api<Historico>(`/api/clientes/${historicoClienteId}/historico?idSalao=${sessao.usuario.idSalao}`)); }, "Historico carregado."); }}><select className={classeInput} value={historicoClienteId} onChange={(e) => setHistoricoClienteId(e.target.value)}><option value="">Selecione um cliente</option>{clientes.map((item) => <option key={item.id} value={item.id}>{item.nomeCompleto}</option>)}</select><Button disabled={pending} type="submit">Carregar historico</Button></form></Card>
                <Card titulo="Resumo de relacionamento">{historico ? <div className="space-y-4"><div className="rounded-3xl bg-stone-950 p-5 text-stone-50"><p className="text-3xl font-semibold">{historico.nomeCliente}</p><p className="mt-2 text-sm text-stone-400">Total: {historico.totalAtendimentos} - Ultimo: {dataHora(historico.ultimoAtendimentoEm)}</p></div><div className="space-y-3">{historico.servicos.length ? historico.servicos.map((item) => <div key={item.idServico} className="rounded-2xl bg-stone-50 px-4 py-3"><p className="font-medium text-stone-900">{item.nomeServico}</p><p className="text-sm text-stone-500">{item.quantidade} recorrencias - {moeda(item.valorTotalCentavos)}</p></div>) : <p className="text-sm text-stone-500">Sem historico de servicos concluidos.</p>}</div></div> : <p className="text-sm text-stone-500">Selecione um cliente para abrir o historico.</p>}</Card>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      <footer className="mt-10 flex flex-wrap items-center gap-4 px-2 pb-4 text-sm text-stone-500">
        <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" />Equipe</span>
        <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />Agenda</span>
        <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4" />Operacao unica</span>
      </footer>
    </main>
  );
}
