import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const prisma = new PrismaClient();

async function main() {
  const defaults = [
    { id: "UNKNOWN", label: "Nao informado" }
  ];

  for (const item of defaults) {
    await prisma.expenseType.upsert({
      where: { id: item.id },
      create: item,
      update: { label: item.label }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
