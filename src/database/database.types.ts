import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export interface IDatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password?: string;
  connectionLimit?: number;
}

export type QueryParams = any[];

export interface ITransactionRunner {
  <T>(callback: (connection: PoolConnection) => Promise<T>): Promise<T>;
}

export { Pool, PoolConnection, ResultSetHeader, RowDataPacket };
