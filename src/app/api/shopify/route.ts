import { NextResponse } from "next/server";
import { fetchShopifyOrders } from "@/app/dashboard/connections/lib/shopify";

export async function GET() {
  try {
    const orders = await fetchShopifyOrders(
      "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"
    );
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error in Shopify API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch Shopify orders" },
      { status: 500 }
    );
  }
}
