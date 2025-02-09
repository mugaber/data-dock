import { fetchForecastData, FORECAST_ENDPOINTS } from "./forecast";

export { FORECAST_ENDPOINTS, fetchForecastData };

export interface ConnectionCardProps {
  type?: string;
  name?: string;
  apiKey?: string;
  syncInterval?: string;
  onEdit?: () => void;
  onDock?: () => void;
  connectionUrl?: string;
  username?: string;
  password?: string;
  dbName?: string;
}
