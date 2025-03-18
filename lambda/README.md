# Data Dock Lambda Functions

This directory contains AWS Lambda functions for automating data synchronization in Data Dock.

## Overview

The Lambda functions in this directory are designed to automate the process of fetching data from external APIs (like Forecast and Intect) and inserting it into the corresponding databases. This eliminates the need for users to keep the application open during the sync process.

## Functions

### 1. Connection Sync Trigger (`connection-sync-trigger/index.ts`)

This function serves as the entry point for the sync process. It can be triggered in two ways:

- When a new connection is created (via API Gateway)
- On a schedule (via EventBridge Scheduler)

It retrieves the connection details and invokes the appropriate sync function based on the connection type.

### 2. Forecast Sync (`forecast-sync/index.ts`)

This function handles the synchronization of data from the Forecast API. It:

- Fetches data from various Forecast endpoints
- Processes the data in chunks
- Inserts the data into the corresponding database tables

### 3. Intect Sync (to be implemented)

Similar to the Forecast Sync function, but for Intect connections.

## Deployment

The functions are deployed using the Serverless Framework. To deploy:

1. Install dependencies:

   ```
   npm install
   ```

2. Configure AWS credentials:

   ```
   aws configure
   ```

3. Deploy the functions:
   ```
   npm run deploy
   ```

## Environment Variables

The following environment variables are required:

- `AWS_RDS_HOST`: The hostname of the RDS instance
- `AWS_RDS_PORT`: The port of the RDS instance
- `AWS_RDS_USER`: The admin username for the RDS instance
- `AWS_RDS_PASSWORD`: The admin password for the RDS instance
- `DATABASE_URL`: The connection URL for the main database
- `SYNC_LAMBDA_ENDPOINT`: The API Gateway endpoint for the sync Lambda function

## Schedules

The functions are scheduled to run at different intervals based on the connection's `syncInterval` setting:

- **Daily**: Runs at 1:00 AM UTC every day
- **Weekly**: Runs at 2:00 AM UTC every Monday
- **Monthly**: Runs at 3:00 AM UTC on the 1st of every month

## Monitoring

Logs for the Lambda functions can be viewed in AWS CloudWatch Logs. Each function has its own log group.
