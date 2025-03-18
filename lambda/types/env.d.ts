declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FORECAST_SYNC_LAMBDA: string;
      INTECT_SYNC_LAMBDA: string;
      DATABASE_URL: string;
      AWS_RDS_HOST: string;
      AWS_RDS_PORT: string;
      AWS_RDS_USER: string;
      AWS_RDS_PASSWORD: string;
      AWS_REGION: string;
      STAGE: string;
    }
  }
}

export {};
