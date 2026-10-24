import { createBrowserClient } from "@supabase/ssr";
import type { Database, Json, Row, TableName } from "./database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const configured = Boolean(url && key);
export const supabase = configured
  ? createBrowserClient<Database>(url!, key!)
  : null;
export function client() {
  if (!supabase)
    throw new Error("ActionOS is waiting for its project connection.");
  return supabase;
}
export type Query = {
  eq?: Record<string, string | boolean>;
  in?: Record<string, string[]>;
  page?: number;
  limit?: number;
  order?: string;
  ascending?: boolean;
  search?: { column: string; value: string };
};
export async function rows<T extends TableName>(
  table: T,
  options: Query = {},
): Promise<Row<T>[]> {
  let query = client().from(table).select("*");
  for (const [k, v] of Object.entries(options.eq ?? {}))
    query = query.eq(k as never, v as never);
  for (const [k, v] of Object.entries(options.in ?? {}))
    query = query.in(k, v as never);
  if (options.search?.value)
    query = query.ilike(
      options.search.column,
      `%${options.search.value.replace(/[%_]/g, "")}%`,
    );
  const size = options.limit ?? 24;
  const { data, error } = await query
    .order(options.order ?? "created_at", {
      ascending: options.ascending ?? false,
    })
    .range((options.page ?? 0) * size, (options.page ?? 0) * size + size - 1);
  if (error) throw new Error(error.message);
  return data as unknown as Row<T>[];
}
export async function mutate(
  operation: string,
  payload: Record<string, Json | undefined> = {},
) {
  const membership = operation.startsWith("organisation.member.");
  const { data, error } = await client().rpc(
    membership ? "actionos_organisation_member" : "actionos_mutate",
    {
      operation: membership
        ? operation.replace("organisation.member.", "")
        : operation,
      payload,
    },
  );
  if (error) throw new Error(error.message);
  return data as { id: string; slug?: string };
}
export async function discover(options: {
  search_text: string;
  cause_filter: string;
  mode_filter: string;
  city_filter: string;
  stage_filter: string;
  skill_filter: string;
  beginner_only: boolean;
  fits_hours: boolean;
  recommended: boolean;
  page_number: number;
}) {
  const { data, error } = await client().rpc("actionos_discover", options);
  if (error) throw new Error(error.message);
  return data;
}
export async function upload(bucket: string, parts: string[], file: File) {
  const supported = [
    "image/jpeg",
    "image/png",
    "image/webp",
    ...(bucket === "initiative-evidence"
      ? ["application/pdf", "text/csv"]
      : bucket === "organisation-verification"
        ? ["application/pdf"]
        : []),
  ];
  const maximum = ["avatars", "organisation-logos"].includes(bucket)
    ? 2
    : bucket === "impact-post-media"
      ? 5
      : 10;
  if (!supported.includes(file.type))
    throw new Error("Choose a supported image, PDF, or CSV for this upload.");
  if (file.size > maximum * 1024 * 1024)
    throw new Error(`The file must be under ${maximum} MB.`);
  const path = [
    ...parts,
    `${crypto.randomUUID()}.${
      file.name
        .split(".")
        .pop()
        ?.replace(/[^a-z0-9]/gi, "") || "bin"
    }`,
  ].join("/");
  const { error } = await client()
    .storage.from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}
export async function fileUrl(bucket: string, path: string) {
  const { data, error } = await client()
    .storage.from(bucket)
    .createSignedUrl(path, 120);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}
