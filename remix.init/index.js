import { copyFile, readFile, writeFile } from "fs/promises";
import { join } from "path";

export async function main({ rootDirectory }) {
  const EXAMPLE_ENV_PATH = join(rootDirectory, ".env.example");
  const ENV_PATH = join(rootDirectory, ".env");

  const env = await readFile(EXAMPLE_ENV_PATH, "utf-8");

  await Promise.all([
    writeFile(ENV_PATH, env),
    copyFile(
      join(rootDirectory, "remix.init", "gitignore"),
      join(rootDirectory, ".gitignore")
    ),
  ]);
}
