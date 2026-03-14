import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function gerarHashSenha(senha: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(senha, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function validarSenha(senha: string, hashArmazenado: string): boolean {
  const [salt, hash] = hashArmazenado.split(":");
  if (!salt || !hash) {
    return false;
  }

  const hashBuffer = Buffer.from(hash, "hex");
  const hashTentativa = scryptSync(senha, salt, 64);

  if (hashBuffer.length !== hashTentativa.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, hashTentativa);
}
