import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_PUBLIC_URL or DATABASE_URL is required to run drizzle commands");
}

export default defineConfig({
  schema: [
    "./drizzle/schema.ts",
    "./drizzle/schema-questions.ts",
    "./drizzle/schema-metas.ts",
    "./drizzle/schema-plans.ts",
    "./drizzle/schema-avisos.ts",
    "./drizzle/schema-forum.ts",
    "./drizzle/schema-dashboard.ts",
    "./drizzle/schema-materials-v4.ts",
    "./drizzle/schema-notices.ts",
  ],
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: connectionString,
  },
});
