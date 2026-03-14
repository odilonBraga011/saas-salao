export interface EntradaInicializacaoSistema {
  nomeSalao: string;
  slugSalao: string;
  nomeProprietario: string;
  emailProprietario: string;
  senhaProprietario: string;
}

export interface RepositorioInicializacao {
  sistemaJaInicializado(): Promise<boolean>;
  inicializarSistema(dados: EntradaInicializacaoSistema): Promise<void>;
}
