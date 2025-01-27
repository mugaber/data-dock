import { FORECAST_ENDPOINTS, EndpointData } from "./forecast";

export interface ConnectionCardProps {
  id: string;
  displayName: string;
  name: "forecast" | "intect" | "planday";
  onEdit: () => void;
}

export const connections: ConnectionCardProps[] = [
  {
    id: "1",
    displayName: "Forecast connection",
    name: "forecast",
    onEdit: () => {},
  },
  {
    id: "2",
    displayName: "Intect connection",
    name: "intect",
    onEdit: () => {},
  },
  {
    id: "3",
    displayName: "Planday connection",
    name: "planday",
    onEdit: () => {},
  },
];

export type { EndpointData };
export { FORECAST_ENDPOINTS };
