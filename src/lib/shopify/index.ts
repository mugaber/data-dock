import {
  ShopifyLineItem,
  ShopifyCustomer,
  ShopifyOrder,
} from "@/app/dashboard/connections/lib/shopify";

export interface SimplifiedCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface SimplifiedLineItem {
  id: string;
  name: string;
  quantity: number;
}

export interface ProcessedShopifyOrder
  extends Omit<ShopifyOrder, "customer" | "lineItems"> {
  customer?: SimplifiedCustomer | null;
  lineItems: SimplifiedLineItem[];
}

export interface ParsedShopifyData {
  orders: ProcessedShopifyOrder[];
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
  const orderLineItemsMap = new Map<string, SimplifiedLineItem[]>();

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
          // Initialize empty line items array for this order
          orderLineItemsMap.set(parsed.id, []);
          // If order has customer info, add to unique customers map
          if (parsed.customer?.id) {
            customersMap.set(parsed.customer.id, parsed.customer);
          }
        }

        // If it's a line item
        if (parsed.__parentId && parsed.id && parsed.variant) {
          lineItems.push(parsed);
          // Add simplified line item to the parent order's array
          const simplifiedLineItem: SimplifiedLineItem = {
            id: parsed.id,
            name: parsed.name,
            quantity: parsed.quantity,
          };
          const orderLineItems = orderLineItemsMap.get(parsed.__parentId) || [];
          orderLineItems.push(simplifiedLineItem);
          orderLineItemsMap.set(parsed.__parentId, orderLineItems);
        }
      } catch (parseError) {
        console.error("Error parsing line:", line);
        console.error("Parse error:", parseError);
      }
    });

  // Convert orders to have simplified customer info and line items
  const processedOrders = orders.map((order) => {
    const simplifiedLineItems = orderLineItemsMap.get(order.id) || [];

    if (!order.customer) {
      return {
        ...order,
        customer: null,
        lineItems: simplifiedLineItems,
      } as ProcessedShopifyOrder;
    }

    // Create simplified customer object
    const simplifiedCustomer: SimplifiedCustomer = {
      id: order.customer.id,
      email: order.customer.email,
      firstName: order.customer.firstName,
      lastName: order.customer.lastName,
    };

    // Return order with simplified customer and line items
    return {
      ...order,
      customer: simplifiedCustomer,
      lineItems: simplifiedLineItems,
    } as ProcessedShopifyOrder;
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
