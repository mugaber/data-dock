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
  const promises = [];
  const forecastData = [];
  let completedSteps = 0;
  const totalSteps = endpoints.length;

  try {
    for (const endpoint of endpoints) {
      promises.push(
        fetch(
          `https://api.forecast.it/api/${endpoint.version}${endpoint.path}`,
          {
            headers: {
              "X-FORECAST-API-KEY": apiKey,
            },
          }
        )
      );
    }

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

      forecastData.push({
        name: getEndpointName(response.url),
        data: pageContents,
      });

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
