import { readFile, writeFile } from "node:fs/promises";

const schemaPath = new URL("./schema.prisma", import.meta.url);
const netlifySchemaPath = new URL("./schema.netlify.prisma", import.meta.url);
const schema = await readFile(schemaPath, "utf8");
const sqliteProvider = 'provider = "sqlite"';

if (!schema.includes(sqliteProvider)) {
  throw new Error(`Expected ${sqliteProvider} in prisma/schema.prisma`);
}

await writeFile(
  netlifySchemaPath,
  schema.replace(sqliteProvider, 'provider = "postgresql"'),
  "utf8",
);