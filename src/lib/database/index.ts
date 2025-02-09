import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import forecastSchema from "./schema/forecast";

const adminPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

interface SchemaConfig {
  dbName: string;
  username: string;
}

export async function createSchema({ dbName, username }: SchemaConfig) {
  const dbPrisma = new PrismaClient({
    datasources: {
      db: {
        url: `postgresql://${process.env.AWS_RDS_USER}:${process.env.AWS_RDS_PASSWORD}@${process.env.AWS_RDS_HOST}:${process.env.AWS_RDS_PORT}/${dbName}?sslmode=require`,
      },
    },
  });

  try {
    await dbPrisma.$executeRawUnsafe(`CREATE SCHEMA forecast;`);
    await dbPrisma.$executeRawUnsafe(
      `GRANT USAGE ON SCHEMA forecast TO ${username};`
    );
    await dbPrisma.$executeRawUnsafe(
      `GRANT CREATE ON SCHEMA forecast TO ${username};`
    );
    await dbPrisma.$executeRawUnsafe(
      `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA forecast TO ${username};`
    );
    await dbPrisma.$executeRawUnsafe(
      `GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA forecast TO ${username};`
    );
    await dbPrisma.$executeRawUnsafe(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA forecast GRANT ALL ON TABLES TO ${username};`
    );
    await dbPrisma.$executeRawUnsafe(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA forecast GRANT ALL ON SEQUENCES TO ${username};`
    );

    await dbPrisma.$executeRawUnsafe(`
      CREATE TABLE forecast.metadata (
        id SERIAL PRIMARY KEY,
        last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        sync_status VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await dbPrisma.$executeRawUnsafe(`
      CREATE TABLE forecast.sync_logs (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50),
        status VARCHAR(50),
        message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await dbPrisma.$executeRawUnsafe(forecastSchema.projectsTable);
    await dbPrisma.$executeRawUnsafe(forecastSchema.personCostPeriodsTable);
    await dbPrisma.$executeRawUnsafe(forecastSchema.expenseItemsTable);
    await dbPrisma.$executeRawUnsafe(forecastSchema.expenseCategoriesTable);
    await dbPrisma.$executeRawUnsafe(forecastSchema.personsTable);
    await dbPrisma.$executeRawUnsafe(forecastSchema.rateCardsTable);
    await dbPrisma.$executeRawUnsafe(forecastSchema.timeRegistrationsTable);
  } catch (error) {
    throw error;
  } finally {
    await dbPrisma.$disconnect();
  }
}

interface DatabaseConfig {
  connectionName: string;
  organizationId: string;
  userData: {
    username?: string;
    password?: string;
  };
}

export async function createDatabase({
  connectionName,
  organizationId,
  userData,
}: DatabaseConfig) {
  const orgIdentifier = organizationId.replace(/-/g, "_").substring(0, 5);
  const dbName = `${orgIdentifier}_${connectionName}_db`
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/\s+/g, "_")
    .substring(0, 30);

  const username =
    userData?.username || `user_${orgIdentifier}`.substring(0, 12);
  const password = userData?.password || randomBytes(16).toString("hex");

  try {
    const userExists = await adminPrisma.$executeRawUnsafe(
      `SELECT 1 FROM pg_roles WHERE rolname = '${username}';`
    );

    if (!userExists) {
      await adminPrisma.$executeRawUnsafe(
        `CREATE USER ${username} WITH ENCRYPTED PASSWORD '${password}';`
      );
    }

    await adminPrisma.$executeRawUnsafe(`CREATE DATABASE "${dbName}";`);

    await adminPrisma.$executeRawUnsafe(
      `GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO ${username};`
    );

    await adminPrisma.$disconnect();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await createSchema({ dbName, username });

    const connectionUrl = `postgresql://${username}:${password}@${process.env.AWS_RDS_HOST}:${process.env.AWS_RDS_PORT}/${dbName}`;

    return {
      dbName,
      username,
      password,
      host: process.env.AWS_RDS_HOST,
      port: process.env.AWS_RDS_PORT,
      connectionUrl,
    };
  } catch (error) {
    console.error("Error in database creation process:", error);
    throw error;
  }
}

export async function deleteDatabase(
  dbName: string,
  username: string,
  deleteOrgUser: boolean
) {
  try {
    await adminPrisma.$executeRawUnsafe(
      `REVOKE ALL PRIVILEGES ON DATABASE "${dbName}" FROM ${username};`
    );

    await adminPrisma.$executeRawUnsafe(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = '${dbName}'
        AND pid <> pg_backend_pid();
      `);

    await adminPrisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${dbName}";`);

    if (deleteOrgUser) {
      await adminPrisma.$executeRawUnsafe(`DROP USER IF EXISTS ${username};`);
    }
  } catch (error) {
    console.error("Error deleting database:", error);
    throw error;
  }
}

export async function testConnection(connectionUrl: string) {
  const testPrisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionUrl,
      },
    },
  });

  try {
    await testPrisma.$connect();
    return true;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  } finally {
    await testPrisma.$disconnect();
  }
}
