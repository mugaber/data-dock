import {
  ShopifyLineItem,
  ShopifyCustomer,
  ShopifyOrder,
  ShopifyDraftOrder,
  ShopifyRefund,
} from "@/app/dashboard/connections/lib/shopify";

export interface ProcessedShopifyOrder
  extends Omit<ShopifyOrder, "customer" | "lineItems"> {
  customerId?: string | null;
  lineItemsIds: string[];
}

export interface ProcessedShopifyDraftOrder
  extends Omit<ShopifyDraftOrder, "customer" | "lineItems"> {
  customerId?: string | null;
  lineItemsIds: string[];
}

export interface ParsedShopifyData {
  orders: ProcessedShopifyOrder[];
  draftOrders: ProcessedShopifyDraftOrder[];
  lineItems: ShopifyLineItem[];
  customers: ShopifyCustomer[];
  refunds: ShopifyRefund[];
}

export async function parseShopifyBulkData(
  url: string
): Promise<ParsedShopifyData> {
  console.log("Downloading data from:", url);

  const dataResponse = await fetch(url);
  if (!dataResponse.ok) {
    throw new Error(
      `Failed to fetch bulk operation data: ${dataResponse.statusText}`
    );
  }

  const text = await dataResponse.text();
  console.log("Downloaded JSONL file size:", text.length, "bytes");

  const orders: ShopifyOrder[] = [];
  const draftOrders: ShopifyDraftOrder[] = [];
  const lineItems: ShopifyLineItem[] = [];
  const lineItemsMap = new Map<string, string[]>();
  const customersMap = new Map<string, ShopifyCustomer>();
  const refunds: ShopifyRefund[] = [];

  // First pass: collect all orders, draft orders, line items, and build unique customers map
  text
    .split("\n")
    .filter(Boolean)
    .forEach((line) => {
      try {
        const parsed = JSON.parse(line);

        // If it's a regular order
        if (!parsed.__parentId && parsed.id && parsed.name && !parsed.status) {
          orders.push(parsed);
          // Initialize empty line items array for this order
          lineItemsMap.set(parsed.id, []);
          // If order has customer info, add to unique customers map
          if (parsed.customer?.id) {
            customersMap.set(parsed.customer.id, parsed.customer);
          }
        }

        // If it's a draft order
        if (!parsed.__parentId && parsed.id && parsed.name && parsed.status) {
          draftOrders.push(parsed);
          // Initialize empty line items array for this draft order
          lineItemsMap.set(parsed.id, []);
          // If draft order has customer info, add to unique customers map
          if (parsed.customer?.id) {
            customersMap.set(parsed.customer.id, parsed.customer);
          }
        }

        // If it's a line item
        if (parsed.__parentId && parsed?.id?.includes("LineItem")) {
          lineItems.push(parsed);
          // add line item to the map for both order and draft order
          lineItemsMap.get(parsed.__parentId)?.push(parsed.id);
        }

        // If it's a refund
        if (parsed.__typename === "Refund") {
          refunds.push(parsed);
          // If refund's order has customer info, add to unique customers map
          if (parsed.order?.customer?.id) {
            customersMap.set(parsed.order.customer.id, parsed.order.customer);
          }
        }
      } catch (parseError) {
        console.error("Error parsing line:", line);
        console.error("Parse error:", parseError);
      }
    });

  const processedOrders = orders.map((order) => {
    const lineItemsIds = lineItemsMap.get(order.id) || [];

    const { customer, billingAddress, shippingAddress, ...rest } = order;

    return {
      ...rest,
      customerId: customer?.id,
      lineItemsIds: lineItemsIds,
      billingAddressId: billingAddress?.id,
      shippingAddressId: shippingAddress?.id,
    } as ProcessedShopifyOrder;
  });

  const processedDraftOrders = draftOrders.map((order) => {
    const lineItemsIds = lineItemsMap.get(order.id) || [];

    const { customer, billingAddress, shippingAddress, ...rest } = order;

    return {
      ...rest,
      customerId: customer?.id,
      lineItemsIds: lineItemsIds,
      billingAddressId: billingAddress?.id,
      shippingAddressId: shippingAddress?.id,
    } as ProcessedShopifyDraftOrder;
  });

  const result: ParsedShopifyData = {
    orders: processedOrders,
    draftOrders: processedDraftOrders,
    lineItems,
    customers: Array.from(customersMap.values()),
    refunds,
  };

  console.log("Parsed Data:", {
    totalOrders: result.orders.length,
    totalDraftOrders: result.draftOrders.length,
    totalLineItems: result.lineItems.length,
    totalUniqueCustomers: result.customers.length,
    totalRefunds: result.refunds.length,
    orders: result.orders,
    draftOrders: result.draftOrders,
    lineItems: result.lineItems,
    customers: result.customers,
    refunds: result.refunds,
    sampleOrder: result.orders[0],
    sampleDraftOrder: result.draftOrders[0],
    sampleLineItem: result.lineItems[0],
    sampleCustomer: result.customers[0],
    sampleRefund: result.refunds[0],
    firstFiveOrderIds: result.orders.slice(0, 5).map((order) => order.id),
    firstFiveDraftOrderIds: result.draftOrders
      .slice(0, 5)
      .map((order) => order.id),
    firstFiveCustomerIds: result.customers
      .slice(0, 5)
      .map((customer) => customer.id),
    firstFiveRefundIds: result.refunds.slice(0, 5).map((refund) => refund.id),
  });

  return result;
}
