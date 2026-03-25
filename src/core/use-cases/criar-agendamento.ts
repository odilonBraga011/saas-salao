import { EntidadeAgendamento } from "@/core/entities/agendamento";
import { RepositorioAgendamento } from "@/core/repositories/repositorio-agendamento";

interface EntradaCriarAgendamento {
  idSalao: string;
  idCliente: string;
  idProfissional: string;
  inicioEm: Date;
  fimEm: Date;
  observacao?: string;
  itens?: EntidadeAgendamento["itens"];
}

export class CasoDeUsoCriarAgendamento {
  constructor(private readonly repositorioAgendamento: RepositorioAgendamento) {}

  async executar(entrada: EntradaCriarAgendamento): Promise<EntidadeAgendamento> {
    if (entrada.fimEm <= entrada.inicioEm) {
      throw new Error("Horário de fim deve ser maior que o horário de início.");
    }

    const existeConflito = await this.repositorioAgendamento.existeConflitoDeHorario({
      idSalao: entrada.idSalao,
      idProfissional: entrada.idProfissional,
      inicioEm: entrada.inicioEm,
      fimEm: entrada.fimEm
    });

    if (existeConflito) {
      throw new Error("Profissional já possui agendamento no intervalo informado.");
    }

    return this.repositorioAgendamento.criar({
      ...entrada,
      status: "AGENDADO"
    });
  }
}
