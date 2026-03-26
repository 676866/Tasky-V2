import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
//check if connected  db
adapter.connect().then(() => {
  try {
    console.log("Connected to DB");
  } catch (error) {
    console.error("Failed to connect to Neon", error);
    return;
  }
});
const prisma = new PrismaClient({ adapter });

export { prisma };
