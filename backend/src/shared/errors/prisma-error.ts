type PrismaLikeError = Error & {
  code?: string;
};

export type PrismaErrorKind = "connectivity" | "unique" | "schema" | "unknown";

const CONNECTIVITY_CODE_SET = new Set(["P1001", "P1002", "P1003", "P1017"]);
const UNIQUE_CODE = "P2002";
const MISSING_TABLE_CODE = "P2021";

function getPrismaCode(error: unknown): string | null {
  if (!(error instanceof Error)) return null;
  const code = (error as PrismaLikeError).code;
  if (!code || typeof code !== "string") return null;
  return code.trim().toUpperCase();
}

export function classifyPrismaError(error: unknown): PrismaErrorKind {
  if (!(error instanceof Error)) return "unknown";

  const code = getPrismaCode(error);
  if (code && CONNECTIVITY_CODE_SET.has(code)) {
    return "connectivity";
  }
  if (code === UNIQUE_CODE) {
    return "unique";
  }
  if (code === MISSING_TABLE_CODE) {
    return "schema";
  }

  const prismaInit = error.name === "PrismaClientInitializationError";
  const unreachable = /can't reach database server|p1001|connect|database server|connection refused/i.test(
    error.message
  );
  if (prismaInit || unreachable) {
    return "connectivity";
  }

  const relationMissing = /relation .* does not exist|table .* does not exist|p2021/i.test(error.message);
  if (relationMissing) {
    return "schema";
  }

  return "unknown";
}
