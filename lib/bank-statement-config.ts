import "server-only";

import { prisma } from "@/lib/prisma";
import {
  decimalToNumber,
  STATEMENT_CONFIG_ID,
  type StatementConfigRecord,
} from "@/lib/bank-statement-shared";

export {
  decimalToNumber,
  formatAmountForInput,
  formatArs,
  formatMovementDateTime,
  formatStatementDate,
  parseArsAmount,
  parseDateInput,
  parseMovementDate,
  STATEMENT_CONFIG_ID,
  toDateInputValue,
  type StatementConfigRecord,
} from "@/lib/bank-statement-shared";

export async function getStatementConfig(): Promise<StatementConfigRecord> {
  const config = await prisma.bankStatementConfig.upsert({
    where: { id: STATEMENT_CONFIG_ID },
    create: { id: STATEMENT_CONFIG_ID },
    update: {},
  });

  return {
    initialBalance: decimalToNumber(config.initialBalance) ?? 0,
    initialBalanceDate: config.initialBalanceDate.toISOString(),
  };
}

export async function updateStatementConfig(input: {
  initialBalance: number;
  initialBalanceDate: Date;
}): Promise<StatementConfigRecord> {
  const config = await prisma.bankStatementConfig.upsert({
    where: { id: STATEMENT_CONFIG_ID },
    create: {
      id: STATEMENT_CONFIG_ID,
      initialBalance: input.initialBalance,
      initialBalanceDate: input.initialBalanceDate,
    },
    update: {
      initialBalance: input.initialBalance,
      initialBalanceDate: input.initialBalanceDate,
    },
  });

  return {
    initialBalance: decimalToNumber(config.initialBalance) ?? 0,
    initialBalanceDate: config.initialBalanceDate.toISOString(),
  };
}
