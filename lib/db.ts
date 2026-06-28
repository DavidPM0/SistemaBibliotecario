import { promises as fs } from "fs";
import path from "path";
import { Store } from "@/lib/types";

const storePath = path.join(process.cwd(), "data", "store.json");

export async function readStore(): Promise<Store> {
  const raw = await fs.readFile(storePath, "utf8");
  return JSON.parse(raw) as Store;
}

export async function writeStore(next: Store): Promise<void> {
  await fs.writeFile(storePath, JSON.stringify(next, null, 2), "utf8");
}

export function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

