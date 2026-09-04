import { NextResponse } from "next/server";

// Server-side only: exposes the backend origin (from runtime env) so browser
// code can build the rider GPS WebSocket URL without any hardcoded host.
export async function GET() {
  const apiOrigin =
    process.env.BACKEND_ORIGIN ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://api.homatri.com";
  return NextResponse.json({ apiOrigin });
}
