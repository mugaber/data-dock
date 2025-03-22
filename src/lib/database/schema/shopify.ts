const ordersTable = `
  CREATE TABLE shopify.orders (
    id TEXT PRIMARY KEY,
    name TEXT,
    note TEXT,
    email TEXT,
    taxes_included BOOLEAN,
    currency_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    tax_exempt BOOLEAN,
    display_financial_status TEXT,
    display_fulfillment_status TEXT,
    total_price DECIMAL,
    subtotal_price DECIMAL,
    total_tax DECIMAL,
    customer JSONB,
    shipping_address JSONB,
    billing_address JSONB
  );
`;

const customersTable = `
  CREATE TABLE shopify.customers (
    id TEXT PRIMARY KEY,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    first_name TEXT,
    last_name TEXT,
    state TEXT,
    amount_spent JSONB,
    last_order JSONB,
    verified_email BOOLEAN,
    tax_exempt BOOLEAN,
    phone TEXT,
    default_address JSONB
  );
`;

const lineItemsTable = `
  CREATE TABLE shopify.line_items (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES shopify.orders(id),
    variant JSONB,
    product JSONB,
    name TEXT,
    sku TEXT,
    vendor TEXT,
    quantity INTEGER,
    requires_shipping BOOLEAN,
    taxable BOOLEAN,
    is_gift_card BOOLEAN,
    fulfillment_service JSONB,
    custom_attributes JSONB,
    CONSTRAINT fk_order
      FOREIGN KEY(order_id) 
      REFERENCES shopify.orders(id)
      ON DELETE CASCADE
  );
`;

const shopifySchema = {
  ordersTable,
  customersTable,
  lineItemsTable,
};

export default shopifySchema;
