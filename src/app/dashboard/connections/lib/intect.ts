import { ConnectionCardProps } from "./index";

export const fetchIntectData = async (connection: ConnectionCardProps) => {
  const credentials = Buffer.from(
    `${connection.name}:${connection.apiKey}`
  ).toString("base64");

  const response = await fetch("https://api.intect.app/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
  });

  const authData = await response.json();

  const salaryBatchesResponse = await fetch(
    "https://api.intect.app/api/salarybatches",
    {
      method: "GET",
      headers: {
        Authorization: `Token ${authData.Token}`,
      },
    }
  );

  const salaryBatches = await salaryBatchesResponse.json();

  return [
    {
      name: "salary_batches",
      data: salaryBatches,
    },
  ];
};
