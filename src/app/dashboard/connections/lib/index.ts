import { FORECAST_ENDPOINTS, EndpointData } from "./forecast";

export interface ConnectionCardProps {
  id: string;
  displayName: string;
  name: "forecast" | "intect" | "planday";
  apiKey?: string;
  syncInterval?: "daily" | "weekly" | "monthly";
  onEdit?: () => void;
  onDock?: () => void;
}

export const connections: ConnectionCardProps[] = [
  {
    id: "1",
    displayName: "Forecast connection",
    name: "forecast",
    apiKey: "1234567890",
    syncInterval: "monthly",
    onEdit: () => {},
  },
  {
    id: "2",
    displayName: "Intect connection",
    name: "intect",
    apiKey: "1234567890",
    syncInterval: "monthly",
    onEdit: () => {},
  },
  {
    id: "3",
    displayName: "Planday connection",
    name: "planday",
    apiKey: "1234567890",
    syncInterval: "monthly",
    onEdit: () => {},
  },
];

export type { EndpointData };
export { FORECAST_ENDPOINTS };
