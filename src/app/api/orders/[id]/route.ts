// app/api/orders/[id]/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const auth = "Basic " + Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64");

  try {
    const res = await fetch(`${process.env.WC_API_BASE}/wp-json/wc/v3/orders/${id}`, {
      headers: { Authorization: auth }
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "無法獲取訂單" }, { status: 500 });
  }
}