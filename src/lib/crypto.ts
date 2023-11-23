import crypto, { BinaryToTextEncoding } from "crypto";

export function createHash(
  file: Buffer,
  hashingAlgorithm: string,
  encoding: BinaryToTextEncoding
) {
  return crypto.createHash(hashingAlgorithm).update(file).digest(encoding);
}

export const hex2UUID = (hex: string) =>
  hex.slice(0, 32).replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
