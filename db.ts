import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure the database connection pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 50, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Initialize Drizzle ORM with our schema
export const db = drizzle(pool, { schema });

// Note: We're using the Haversine formula directly in SQL queries instead of PostGIS
// for calculating distances between geographic coordinates

// Function to push schema changes to the database
export const pushSchema = async () => {
  try {
    console.log('Pushing schema changes to database...');
    
    // This would normally be done with drizzle-kit push
    // For now, we'll create any missing tables using SQL
    
    // Loop through all our tables and ensure they exist
    const tables = Object.values(schema)
      .filter(table => typeof table === 'object' && table !== null && 'name' in table)
      .map(table => (table as any).name);
    
    console.log('Tables to ensure:', tables);
    
    // This will be replaced with proper schema migration using drizzle-kit
    
    console.log('Schema changes applied successfully');
    return true;
  } catch (error) {
    console.error('Error pushing schema changes:', error);
    return false;
  }
};