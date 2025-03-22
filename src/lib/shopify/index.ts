import {
  ShopifyOrder,
  ShopifyLineItem,
  ShopifyCustomer,
} from "@/app/dashboard/connections/lib/shopify";

export interface SimplifiedCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface ParsedShopifyData {
  orders: (Omit<ShopifyOrder, "customer"> & {
    customer?: SimplifiedCustomer | null;
  })[];
  lineItems: ShopifyLineItem[];
  customers: ShopifyCustomer[];
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
  const lineItems: ShopifyLineItem[] = [];
  const customersMap = new Map<string, ShopifyCustomer>();

  // First pass: collect all orders and line items, and build unique customers map
  text
    .split("\n")
    .filter(Boolean)
    .forEach((line) => {
      try {
        const parsed = JSON.parse(line);

        // If it's an order
        if (!parsed.__parentId && parsed.id && parsed.name) {
          orders.push(parsed);
          // If order has customer info, add to unique customers map
          if (parsed.customer?.id) {
            customersMap.set(parsed.customer.id, parsed.customer);
          }
        }

        // If it's a line item
        if (parsed.__parentId && parsed.id && parsed.variant) {
          lineItems.push(parsed);
        }
      } catch (parseError) {
        console.error("Error parsing line:", line);
        console.error("Parse error:", parseError);
      }
    });

  // Convert orders to have simplified customer info
  const processedOrders = orders.map((order) => {
    if (!order.customer) {
      return {
        ...order,
        customer: null,
      };
    }

    // Create simplified customer object
    const simplifiedCustomer: SimplifiedCustomer = {
      id: order.customer.id,
      email: order.customer.email,
      firstName: order.customer.firstName,
      lastName: order.customer.lastName,
    };

    // Return order with simplified customer
    return {
      ...order,
      customer: simplifiedCustomer,
    };
  });

  const result: ParsedShopifyData = {
    orders: processedOrders,
    lineItems,
    customers: Array.from(customersMap.values()),
  };

  console.log("Parsed Data:", {
    totalOrders: result.orders.length,
    totalLineItems: result.lineItems.length,
    totalUniqueCustomers: result.customers.length,
    orders: result.orders,
    lineItems: result.lineItems,
    customers: result.customers,
    sampleOrder: result.orders[0],
    sampleLineItem: result.lineItems[0],
    sampleCustomer: result.customers[0],
    firstFiveOrderIds: result.orders.slice(0, 5).map((order) => order.id),
    firstFiveCustomerIds: result.customers
      .slice(0, 5)
      .map((customer) => customer.id),
  });

  return result;
}
