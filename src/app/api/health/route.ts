export function GET() {
  return Response.json({ app: "actionos-local", version: 2, persistence: "supabase" });
}
