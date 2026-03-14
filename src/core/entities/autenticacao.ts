export interface ResultadoAutenticacao {
  token: string;
  usuario: {
    id: string;
    idSalao: string;
    nomeCompleto: string;
    email: string;
    papel: string;
  };
}
