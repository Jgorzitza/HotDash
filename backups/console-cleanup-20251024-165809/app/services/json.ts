import type { Prisma } from "@prisma/client";

export function toInputJson<T>(data: T): Prisma.InputJsonValue {
  return data as unknown as Prisma.InputJsonValue;
}
