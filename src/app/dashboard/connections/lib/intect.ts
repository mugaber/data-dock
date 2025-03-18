import { ConnectionCardProps } from "./index";

interface SalaryBatch {
  Id: number;
}

interface SalaryBatchRecord {
  Id: number;
  UserEmploymentId?: number;
}

interface SalaryStatement {
  Id: number;
  UserFullName?: string;
  UserEmploymentId?: number;
}

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

  const detailedSalaryBatches = await Promise.all(
    salaryBatches.map(async (batch: SalaryBatch) => {
      const salaryBatchResponse = await fetch(
        `https://api.intect.app/api/salarybatches/${batch.Id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${authData.Token}`,
          },
        }
      );
      return salaryBatchResponse.json();
    })
  );

  const allSalaryStatements = detailedSalaryBatches.flatMap((batch) => {
    if (!batch.SalaryStatements || !Array.isArray(batch.SalaryStatements)) {
      return [];
    }
    return batch.SalaryStatements.map(
      (statement: SalaryStatement) => statement
    );
  });

  const userFullNames = new Map(
    allSalaryStatements.map((statement: SalaryStatement) => [
      statement.UserEmploymentId,
      statement.UserFullName,
    ])
  );

  const allSalaryBatchRecords = detailedSalaryBatches.flatMap((batch) => {
    if (batch.SalaryBatchRecords && Array.isArray(batch.SalaryBatchRecords)) {
      return batch.SalaryBatchRecords.map((record: SalaryBatchRecord) => ({
        ...record,
        UserFullName: userFullNames.get(record.UserEmploymentId),
      }));
    }
    return [];
  });

  const companyUsersResponse = await fetch(
    "https://api.intect.app/api/companyusers/simple/includehidden",
    {
      method: "GET",
      headers: { Authorization: `Token ${authData.Token}` },
    }
  );

  const companyUsers = await companyUsersResponse.json();

  const salaryTypesResponse = await fetch(
    "https://api.intect.app/api/salarytypes/categories",
    {
      method: "GET",
      headers: { Authorization: `Token ${authData.Token}` },
    }
  );

  const salaryTypes = await salaryTypesResponse.json();

  return [
    {
      name: "salary_batches",
      data: detailedSalaryBatches,
    },
    {
      name: "salary_batch_records",
      data: allSalaryBatchRecords,
    },
    {
      name: "salary_statements",
      data: allSalaryStatements,
    },
    {
      name: "company_users",
      data: companyUsers,
    },
    {
      name: "salary_types_categories",
      data: salaryTypes,
    },
  ];
};
