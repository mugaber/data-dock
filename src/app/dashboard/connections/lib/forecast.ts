interface EndpointData {
  path: string;
  version: string;
  name?: string;
  description: string;
}

interface ForecastData {
  id: string;
  totalObjectCount: number;
  pageSize: number;
  pageContents: unknown[];
  path: string;
}

interface NonProjectTime {
  id: number;
  name: string;
  is_internal_time: boolean;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

interface TimeRegistration {
  id: number;
  person: number;
  project: number | null;
  role: number;
  billable_minutes_registered: number;
  phase: number | null;
  task: number | null;
  task_project: number | null;
  non_project_time: number | null;
  time_registered: number;
  date: string;
  notes: string | null;
  approval_status: string;
  invoice_entry: number | null;
  invoice: number | null;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  is_internal_time?: boolean | null;
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
    name: "time_registrations",
    description: "Get time registrations after date",
  },
  // {
  //   path: "/projects/419069/time_registrations",
  //   version: "v3",
  //   name: "projects_time_registrations",
  //   description: "Get project time registrations",
  // },
  {
    path: "/persons",
    version: "v2",
    name: "persons",
    description: "Get all persons",
  },
  {
    path: "/person_cost_periods",
    version: "v1",
    name: "person_cost_periods",
    description: "Get person cost periods",
  },
  {
    path: "/expense_items",
    version: "v1",
    name: "expense_items",
    description: "Get expense items",
  },
  {
    path: "/expense_categories",
    version: "v1",
    name: "expense_categories",
    description: "Get expense categories",
  },
  {
    path: "/rate_cards",
    version: "v1",
    name: "rate_cards",
    description: "Get rate cards",
  },
  {
    path: "/non_project_time",
    version: "v1",
    name: "non_project_time",
    description: "Get non project time",
  },
  {
    path: "/allocations",
    version: "v1",
    name: "allocations",
    description: "Get allocations",
  },
];

const getEndpointName = (url: string) => {
  return FORECAST_ENDPOINTS.find((endpoint) => {
    const responseUrl = new URL(url);
    const cleanPath = responseUrl.pathname.replace(/^\/api\/v\d+/, "");
    return cleanPath === endpoint.path;
  })?.name;
};

const handleMultiplePages = async (
  data: ForecastData,
  path: string,
  apiKey: string,
  onProgress?: (progress: number) => void
) => {
  if (Array.isArray(data)) {
    return data;
  }

  const totalObjects = data?.totalObjectCount;
  const pageSize = data?.pageSize;
  const totalPages = Math.ceil(totalObjects / pageSize);

  const promises = [];
  const pageContents = [];

  let completedSteps = 0;
  const totalSteps = totalPages;

  for (let i = 0; i < totalPages; i++) {
    promises.push(
      fetch(`${path}?pageNumber=${i + 1}`, {
        headers: {
          "X-FORECAST-API-KEY": apiKey,
        },
      })
    );
  }

  const responses = await Promise.all(promises);
  for (const response of responses) {
    completedSteps++;
    onProgress?.(Math.round((completedSteps / totalSteps) * 95));

    const data = await response.json();
    pageContents.push(data.pageContents);
  }

  return pageContents.flat();
};

export const fetchForecastData = async (
  endpoints: EndpointData[],
  apiKey: string,
  onProgress?: (progress: number) => void
) => {
  const forecastData = [];
  let completedSteps = 0;
  const totalSteps = endpoints.length;
  let nonProjectTimeMap: { [key: number]: boolean } = {};

  try {
    const nonProjectTimeEndpoint = endpoints.find(
      (e) => e.name === "non_project_time"
    );
    const remainingEndpoints = endpoints.filter(
      (e) => e.name !== "non_project_time"
    );

    if (nonProjectTimeEndpoint) {
      const response = await fetch(
        `https://api.forecast.it/api/${nonProjectTimeEndpoint.version}${nonProjectTimeEndpoint.path}`,
        {
          headers: {
            "X-FORECAST-API-KEY": apiKey,
          },
        }
      );

      if (response.status > 400) {
        throw new Error("Invalid API key");
      }

      const data = await response.json();
      const pageContents = await handleMultiplePages(
        data,
        response.url,
        apiKey,
        onProgress
      );

      nonProjectTimeMap = pageContents.reduce(
        (acc: { [key: number]: boolean }, item: NonProjectTime) => {
          acc[item.id] = item.is_internal_time;
          return acc;
        },
        {}
      );

      forecastData.push({
        name: "non_project_time",
        data: pageContents,
      });

      completedSteps++;
      onProgress?.(Math.round((completedSteps / totalSteps) * 95));
    }

    // Then fetch remaining endpoints in parallel
    const promises = remainingEndpoints.map((endpoint) =>
      fetch(`https://api.forecast.it/api/${endpoint.version}${endpoint.path}`, {
        headers: {
          "X-FORECAST-API-KEY": apiKey,
        },
      })
    );

    const responses = await Promise.all(promises);
    for (const response of responses) {
      if (response.status > 400) {
        throw new Error("Invalid API key");
      }

      const data = await response.json();
      const pageContents = await handleMultiplePages(
        data,
        response.url,
        apiKey,
        onProgress
      );

      const endpointName = getEndpointName(response.url);
      if (endpointName === "time_registrations") {
        const enrichedPageContents = pageContents.map(
          (item: TimeRegistration) => ({
            ...item,
            id: item.id,
            person: item.person,
            project: item.project,
            role: item.role,
            billable_minutes_registered: item.billable_minutes_registered,
            phase: item.phase,
            task: item.task,
            task_project: item.task_project,
            non_project_time: item.non_project_time,
            is_internal_time: item.non_project_time
              ? nonProjectTimeMap[item.non_project_time]
              : null,
            time_registered: item.time_registered,
            date: item.date,
            notes: item.notes,
            approval_status: item.approval_status,
            invoice_entry: item.invoice_entry,
            invoice: item.invoice,
            created_by: item.created_by,
            updated_by: item.updated_by,
            created_at: item.created_at,
            updated_at: item.updated_at,
          })
        );
        forecastData.push({
          name: endpointName,
          data: enrichedPageContents,
        });
      } else {
        forecastData.push({
          name: endpointName,
          data: pageContents,
        });
      }

      completedSteps++;
      onProgress?.(Math.round((completedSteps / totalSteps) * 95));
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(errorMessage);
  }

  return { forecastData };
};
