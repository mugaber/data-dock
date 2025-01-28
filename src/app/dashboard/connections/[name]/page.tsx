"use client";

import { useParams } from "next/navigation";
import { connectionStorage } from "../../utils/connections";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { EndpointData, FORECAST_ENDPOINTS } from "../lib/forecast";
import { downloadCSV, convertToCSV } from "@/app/dashboard/utils";
import { useAppContext } from "@/context";

export default function ConnectionPage() {
  const { name } = useParams();
  const { parentOrganization } = useAppContext();
  const connection = connectionStorage(name as string, parentOrganization?.id);
  const [, setFetchedData] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState({
    projects: false,
    timeRegistrations: false,
    projectTimeRegistrations: false,
    persons: false,
    personCostPeriods: false,
    expenseItems: false,
    expenseCategories: false,
    rateCards: false,
  });

  if (!connection?.apiKey) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl text-white capitalize font-bold mb-8 text-foreground">
          Connection Not Found
        </h1>
      </div>
    );
  }

  const fetchEndpoint = async (endpoint: EndpointData) => {
    setIsLoading((prev) => ({
      ...prev,
      [endpoint.name as keyof typeof prev]: true,
    }));
    try {
      const response = await fetch(
        `https://api.forecast.it/api/${endpoint.version}${endpoint.path}?pageSize=1000`,
        {
          headers: {
            "X-FORECAST-API-KEY": connection?.apiKey || "",
          },
        }
      );
      const data = await response.json();
      setFetchedData(data);

      if (Array.isArray(data) || data?.pageContents?.length) {
        const content = Array.isArray(data) ? data : data?.pageContents;
        const csvContent = convertToCSV(content);
        downloadCSV(
          csvContent,
          `${endpoint.name}_${new Date().toISOString()}.csv`
        );
      } else {
        console.error("Received data is not an array:", data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading((prev) => ({
        ...prev,
        [endpoint.name as keyof typeof prev]: false,
      }));
    }
  };

  const isAnyEndpointLoading = Object.values(isLoading).some((value) => value);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl text-white capitalize font-bold mb-8 text-foreground">
        {name} connection
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FORECAST_ENDPOINTS.map((endpoint, index) => (
          <Card
            key={index}
            className="p-4 bg-gray-800 border-none hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">
                  API {endpoint.version}
                </span>
              </div>

              <h3 className="text-lg font-semibold mb-2 text-gray-100">
                {endpoint.description}
              </h3>

              <p className="text-sm text-gray-300 mb-4 flex-grow truncate">
                {endpoint.path}
              </p>

              <Button
                onClick={() => fetchEndpoint(endpoint)}
                variant="outline"
                className="w-full"
                disabled={isAnyEndpointLoading}
              >
                {isLoading[endpoint.name as keyof typeof isLoading] ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Download"
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
