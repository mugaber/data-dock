export interface EndpointData {
  path: string;
  version: string;
  name?: string;
  description: string;
}

export const FORECAST_ENDPOINTS: EndpointData[] = [
  {
    path: "/projects",
    version: "v1",
    name: "projects",
    description: "Get all projects",
  },
  {
    path: "/time_registrations/date_after/19900101",
    version: "v4",
    name: "timeRegistrations",
    description: "Get time registrations after date",
  },
  {
    path: "/projects/419069/time_registrations",
    version: "v3",
    name: "projectTimeRegistrations",
    description: "Get project time registrations",
  },
  {
    path: "/persons",
    version: "v2",
    name: "persons",
    description: "Get all persons",
  },
  {
    path: "/person_cost_periods",
    version: "v1",
    name: "personCostPeriods",
    description: "Get person cost periods",
  },
  {
    path: "/expense_items",
    version: "v1",
    name: "expenseItems",
    description: "Get expense items",
  },
  {
    path: "/expense_categories",
    version: "v1",
    name: "expenseCategories",
    description: "Get expense categories",
  },
  {
    path: "/rate_cards",
    version: "v1",
    name: "rateCards",
    description: "Get rate cards",
  },
];
