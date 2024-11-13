import type {UUID} from 'crypto';
import * as crypto from 'crypto';

export function uuid(): UUID {
  return crypto.randomUUID();
}

export function randomString(numberOfBytes: number = 12, encoding: BufferEncoding = 'hex'): string {
  return crypto.randomBytes(numberOfBytes).toString(encoding);
}
