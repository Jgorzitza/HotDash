import { promises as fs } from "fs";
import { resolve } from "path";
import { parse as parseEnv } from "dotenv";

/**
 * Load environment variables from the provided file paths without overriding
 * values that are already set in the current process.
 */
export async function loadEnvFromFiles(paths: string[]): Promise<void> {
  for (const maybeRelative of paths) {
    const filePath = resolve(process.cwd(), maybeRelative);

    try {
      const contents = await fs.readFile(filePath, "utf8");
      const parsed = parseEnv(contents);

      for (const [key, value] of Object.entries(parsed)) {
        if (key && value && process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
        continue;
      }
      throw error;
    }
  }
}
