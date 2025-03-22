import { GraphQLClient } from "graphql-request";

interface ShopifyAddress {
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

interface ShopifyCustomer {
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

interface ShopifyLineItem {
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

interface ShopifyOrder {
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

interface ShopifyOrdersResponse {
  orders: {
    edges: Array<{
      node: ShopifyOrder;
    }>;
  };
}

const SHOPIFY_ORDERS_QUERY = `
  query Orders {
    orders(first: 100) {
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
          lineItems(first: 100) {
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
  }
`;

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

    const response = await client.request<ShopifyOrdersResponse>(
      SHOPIFY_ORDERS_QUERY
    );

    const orders: ShopifyOrder[] = response.orders.edges.map(({ node }) => {
      const orderData = { ...node };
      const lineItemsData = node.lineItems as unknown as {
        edges: Array<{ node: ShopifyLineItem }>;
      };
      return {
        ...orderData,
        lineItems: lineItemsData.edges.map(
          ({ node: lineItemNode }) => lineItemNode
        ),
      };
    });

    return orders;
  } catch (error) {
    console.error("Error fetching Shopify orders:", error);
    throw new Error("Failed to fetch Shopify orders");
  }
}
