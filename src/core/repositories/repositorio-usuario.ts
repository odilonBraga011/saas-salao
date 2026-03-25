export interface EntidadeUsuarioInterno {
  id: string;
  idSalao: string;
  nomeCompleto: string;
  email: string;
  papel: string;
  status: "ATIVO" | "INATIVO" | "BLOQUEADO";
}

export interface RepositorioUsuario {
  listarPorSalao(idSalao: string): Promise<EntidadeUsuarioInterno[]>;
  criar(dados: {
    idSalao: string;
    nomeCompleto: string;
    email: string;
    hashSenha: string;
    papel?: string;
  }): Promise<EntidadeUsuarioInterno>;
}
