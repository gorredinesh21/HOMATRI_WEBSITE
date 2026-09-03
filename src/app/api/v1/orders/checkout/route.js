import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const token = request.headers.get("authorization") || "";

    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "https://homatri-backend-195132182954.us-central1.run.app";

    const response = await fetch(`${backendUrl}/api/v1/orders/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.text().then((text) => {
      if (!text) return null;
      try {
        return JSON.parse(text);
      } catch {
        return { raw: text };
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.detail || data?.message || data?.error || `Checkout failed (${response.status})` },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}
