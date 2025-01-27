interface ConnectionStorage {
  connectionName: string | null;
  apiKey: string | null;
  setConnection?: (connectionName: string, apiKey: string) => void;
  disconnect?: () => void;
}

export const connectionStorage = (
  integrationName: string | undefined,
  organizationId: string | undefined
): ConnectionStorage | undefined => {
  if (!integrationName || !organizationId) return;

  const connectionName = localStorage.getItem(
    `${organizationId}-${integrationName}-connection-name`
  );
  const apiKey = localStorage.getItem(
    `${organizationId}-${integrationName}-api-key`
  );

  const setConnection = (connectionName: string, apiKey: string) => {
    localStorage.setItem(
      `${organizationId}-${integrationName}-connection-name`,
      connectionName
    );
    localStorage.setItem(
      `${organizationId}-${integrationName}-api-key`,
      apiKey
    );
  };

  const disconnect = () => {
    localStorage.removeItem(
      `${organizationId}-${integrationName}-connection-name`
    );
    localStorage.removeItem(`${organizationId}-${integrationName}-api-key`);
  };

  return { connectionName, apiKey, setConnection, disconnect };
};
