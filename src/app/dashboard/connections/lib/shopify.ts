import { GraphQLClient } from "graphql-request";

export interface ShopifyAddress {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
  province: string;
  country: string;
  phone?: string;
  company?: string;
  latitude?: number;
  longitude?: number;
  countryCodeV2: string;
  provinceCode: string;
}

export interface ShopifyCustomer {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  state: string;
  amountSpent: {
    amount: string;
    currencyCode: string;
  };
  lastOrder?: {
    id: string;
    name: string;
    currencyCode: string;
  };
  verifiedEmail: boolean;
  taxExempt: boolean;
  phone?: string;
  defaultAddress?: ShopifyAddress;
}

export interface ShopifyLineItem {
  id: string;
  variant: {
    id: string;
    title: string;
  };
  product: {
    id: string;
  };
  name: string;
  sku: string;
  vendor: string;
  quantity: number;
  requiresShipping: boolean;
  taxable: boolean;
  isGiftCard: boolean;
  fulfillmentService: {
    type: string;
  };
  customAttributes: Array<{
    key: string;
    value: string;
  }>;
}

export interface ShopifyOrder {
  id: string;
  name: string;
  note?: string;
  email: string;
  taxesIncluded: boolean;
  currencyCode: string;
  createdAt: string;
  updatedAt: string;
  taxExempt: boolean;
  displayFinancialStatus: string;
  displayFulfillmentStatus: string;
  totalPrice: string;
  subtotalPrice: string;
  totalTax: string;
  customer?: ShopifyCustomer;
  shippingAddress?: ShopifyAddress;
  billingAddress?: ShopifyAddress;
  lineItems: ShopifyLineItem[];
}

export interface ShopifyDraftOrder {
  id: string;
  name: string;
  note2?: string;
  email?: string;
  taxesIncluded: boolean;
  currencyCode: string;
  invoiceSentAt?: string;
  createdAt: string;
  updatedAt: string;
  taxExempt: boolean;
  completedAt?: string;
  status: string;
  invoiceUrl?: string;
  totalPrice: string;
  subtotalPrice: string;
  totalTax: string;
  customer?: ShopifyCustomer;
  shippingAddress?: ShopifyAddress;
  billingAddress?: ShopifyAddress;
  lineItems: {
    edges: Array<{
      node: ShopifyLineItem;
    }>;
  };
}

export interface ParsedShopifyData {
  orders: ShopifyOrder[];
  draftOrders: ShopifyDraftOrder[];
  lineItems: ShopifyLineItem[];
  customers: ShopifyCustomer[];
}

export interface BulkOperationResponse {
  bulkOperationRunQuery: {
    bulkOperation: {
      id: string;
      status: string;
      url?: string;
    };
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

export interface CurrentBulkOperationResponse {
  currentBulkOperation: {
    id: string;
    status: string;
    objectCount: number;
    url?: string;
  } | null;
}

export interface CancelBulkOperationResponse {
  bulkOperationCancel: {
    bulkOperation: {
      id: string;
      status: string;
    };
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

export const BULK_OPERATION_QUERY = `
  mutation {
    bulkOperationRunQuery(
      query: """
      {
        orders {
          edges {
            node {
              id
              name
              note
              email
              taxesIncluded
              currencyCode
              createdAt
              updatedAt
              taxExempt
              name
              displayFinancialStatus
              displayFulfillmentStatus
              totalPrice
              subtotalPrice
              totalTax
              customer {
                id
                email
                createdAt
                updatedAt
                firstName
                lastName
                state
                amountSpent {
                  amount
                  currencyCode
                }
                lastOrder {
                  id
                  name
                  currencyCode
                }
                verifiedEmail
                taxExempt
                phone
                defaultAddress {
                  id
                  firstName
                  lastName
                  address1
                  address2
                  city
                  province
                  country
                  zip
                  phone
                  name
                  provinceCode
                  countryCodeV2
                }
              }
              shippingAddress {
                id
                firstName
                lastName
                address1
                address2
                city
                zip
                province
                country
                phone
                company
                latitude
                longitude
                countryCodeV2
                provinceCode
              }
              billingAddress {
                id
                firstName
                lastName
                address1
                address2
                city
                zip
                province
                country
                phone
                company
                latitude
                longitude
                countryCodeV2
                provinceCode
              }
              lineItems {
                edges {
                  node {
                    id
                    variant {
                      id
                      title
                    }
                    product {
                      id
                    }
                    name
                    sku
                    vendor
                    quantity
                    requiresShipping
                    taxable
                    isGiftCard
                    fulfillmentService {
                      type
                    }
                    customAttributes {
                      key
                      value
                    }
                  }
                }
              }
            }
          }
        }
        draftOrders {
          edges {
            node {
              id
              name
              note2
              email
              taxesIncluded
              currencyCode
              invoiceSentAt
              createdAt
              updatedAt
              taxExempt
              completedAt
              name
              status
              invoiceUrl
              totalPrice
              subtotalPrice
              totalTax
              customer {
                id
                email
                createdAt
                updatedAt
                firstName
                lastName
                state
                amountSpent {
                  amount
                  currencyCode
                }
                lastOrder {
                  id
                  name
                  currencyCode
                }
                verifiedEmail
                taxExempt
                phone
                defaultAddress {
                  id
                  firstName
                  lastName
                  address1
                  address2
                  city
                  province
                  country
                  zip
                  phone
                  name
                  provinceCode
                  countryCodeV2
                }
              }
              shippingAddress {
                id
                firstName
                lastName
                address1
                address2
                city
                zip
                province
                country
                phone
                company
                latitude
                longitude
                countryCodeV2
                provinceCode
              }
              billingAddress {
                id
                firstName
                lastName
                address1
                address2
                city
                zip
                province
                country
                phone
                company
                latitude
                longitude
                countryCodeV2
                provinceCode
              }
              lineItems {
                edges {
                  node {
                    id
                    variant {
                      id
                      title
                    }
                    product {
                      id
                    }
                    name
                    sku
                    vendor
                    quantity
                    requiresShipping
                    taxable
                    isGiftCard
                    fulfillmentService {
                      type
                    }
                    weight {
                      unit
                      value
                    }
                    custom
                  }
                }
              }
            }
          }
        }
      }
      """
    ) {
      bulkOperation {
        id
        status
        errorCode
        objectCount
        url
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CHECK_BULK_OPERATION_QUERY = `
  query {
    currentBulkOperation {
      id
      status
      errorCode
      objectCount
      url
    }
  }
`;

export const CANCEL_BULK_OPERATION_QUERY = `
  mutation {
    bulkOperationCancel {
      bulkOperation {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

async function waitForBulkOperation(
  client: GraphQLClient,
  maxAttempts = 60
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await client.request<CurrentBulkOperationResponse>(
      CHECK_BULK_OPERATION_QUERY
    );

    const operation = response.currentBulkOperation;
    if (!operation) {
      throw new Error("No bulk operation found");
    }

    if (operation.status === "COMPLETED" && operation.url) {
      return operation.url;
    }

    if (operation.status === "FAILED") {
      throw new Error("Bulk operation failed");
    }

    if (operation.status === "CANCELED") {
      throw new Error("Bulk operation was canceled");
    }

    // Wait for 5 seconds before next attempt
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error("Bulk operation timed out");
}

async function handleExistingOperation(
  client: GraphQLClient,
  operationId: string
): Promise<void> {
  console.log("Found existing operation:", operationId);

  // Try to cancel the existing operation
  const cancelResponse = await client.request<CancelBulkOperationResponse>(
    CANCEL_BULK_OPERATION_QUERY
  );

  if (cancelResponse.bulkOperationCancel.userErrors.length > 0) {
    console.error(
      "Error canceling operation:",
      cancelResponse.bulkOperationCancel.userErrors
    );
    throw new Error("Failed to cancel existing bulk operation");
  }

  // Wait a moment for the cancellation to take effect
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

export async function fetchShopifyOrders(
  accessToken: string
): Promise<ShopifyOrder[]> {
  try {
    const client = new GraphQLClient(
      "https://frama-b2c.myshopify.com/admin/api/2025-01/graphql.json",
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    // Check for existing operation first
    const currentOperation = await client.request<CurrentBulkOperationResponse>(
      CHECK_BULK_OPERATION_QUERY
    );

    if (currentOperation.currentBulkOperation?.id) {
      await handleExistingOperation(
        client,
        currentOperation.currentBulkOperation.id
      );
    }

    // Start the bulk operation
    const response = await client.request<BulkOperationResponse>(
      BULK_OPERATION_QUERY
    );

    console.log("Bulk operation response:", response);

    if (response.bulkOperationRunQuery.userErrors.length > 0) {
      console.error("User errors:", response.bulkOperationRunQuery.userErrors);
      throw new Error(
        `Bulk operation error: ${response.bulkOperationRunQuery.userErrors[0].message}`
      );
    }

    const bulkOperation = response.bulkOperationRunQuery.bulkOperation;
    if (!bulkOperation) {
      throw new Error("No bulk operation was created");
    }

    console.log("Bulk operation started:", bulkOperation);

    // Wait for the operation to complete and get the URL
    const url = await waitForBulkOperation(client);

    if (!url) {
      throw new Error("No URL returned from bulk operation");
    }

    console.log("Bulk operation completed, fetching data from:", url);

    // Fetch the JSONL data
    const dataResponse = await fetch(url);
    if (!dataResponse.ok) {
      throw new Error(
        `Failed to fetch bulk operation data: ${dataResponse.statusText}`
      );
    }

    const text = await dataResponse.text();
    console.log("Received data length:", text.length);

    const orders: ShopifyOrder[] = [];

    // Parse JSONL format
    text.split("\n").forEach((line) => {
      if (line.trim()) {
        try {
          const order = JSON.parse(line);
          if (order.__typename === "Order") {
            orders.push({
              ...order,
              lineItems:
                order.lineItems?.edges?.map(
                  (edge: { node: ShopifyLineItem }) => edge.node
                ) || [],
            });
          }
        } catch (parseError) {
          console.error("Error parsing line:", line);
          console.error("Parse error:", parseError);
        }
      }
    });

    console.log("Processed orders count:", orders.length);
    return orders;
  } catch (error) {
    console.error("Error fetching Shopify orders:", error);
    throw error; // Throw the original error to preserve the stack trace
  }
}
