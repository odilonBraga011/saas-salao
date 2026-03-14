export interface UsuarioAutenticacao {
  id: string;
  idSalao: string;
  nomeCompleto: string;
  email: string;
  hashSenha: string;
  papelPrincipal: string;
}

export interface RepositorioAutenticacao {
  buscarUsuarioPorSlugEEmail(slugSalao: string, email: string): Promise<UsuarioAutenticacao | null>;
}
