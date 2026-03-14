import { createHmac } from "crypto";

interface PayloadToken {
  sub: string;
  idSalao: string;
  papel: string;
  exp: number;
}

const paraBase64Url = (valor: string): string => Buffer.from(valor).toString("base64url");

export function gerarTokenAcesso(input: { sub: string; idSalao: string; papel: string }): string {
  const segredo = process.env.AUTH_SECRET;

  if (!segredo) {
    throw new Error("AUTH_SECRET não configurado.");
  }

  const header = paraBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadObjeto: PayloadToken = {
    sub: input.sub,
    idSalao: input.idSalao,
    papel: input.papel,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12
  };
  const payload = paraBase64Url(JSON.stringify(payloadObjeto));

  const assinatura = createHmac("sha256", segredo).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${assinatura}`;
}
