import { FORECAST_ENDPOINTS, EndpointData } from "./forecast";

export interface ConnectionCardProps {
  type: string;
  name: string;
  apiKey?: string;
  syncInterval?: string;
  onEdit?: () => void;
  onDock?: () => void;
}

export type { EndpointData };
export { FORECAST_ENDPOINTS };
