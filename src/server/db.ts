import "dotenv/config"
import type { FieldPacket, QueryResult } from "mysql2"
import { createPool, type Pool, type PoolConnection } from "mysql2/promise"

const isProd = process.env.NODE_ENV === "production"

export type ExecutableConnection = PoolConnection & {
	execute: <T extends QueryResult = QueryResult>(sql: string, values?: unknown[]) => Promise<[T, FieldPacket[]]>
}

export type ExecutablePool = Pool & {
	execute: <T extends QueryResult = QueryResult>(sql: string, values?: unknown[]) => Promise<[T, FieldPacket[]]>
	getConnection: () => Promise<ExecutableConnection>
}

export const db = createPool({
	host: isProd ? process.env.PROD_MYSQL_HOST : process.env.DEV_MYSQL_HOST,
	user: isProd ? process.env.PROD_MYSQL_USERNAME : process.env.DEV_MYSQL_USERNAME,
	password: isProd ? process.env.PROD_MYSQL_PASSWORD : process.env.DEV_MYSQL_PASSWORD,
	database: isProd ? process.env.PROD_MYSQL_DATABASE : process.env.DEV_MYSQL_DATABASE,
	port: 3306,
	waitForConnections: true,
	connectionLimit: isProd ? 50 : 20,
	queueLimit: 100,
	enableKeepAlive: true,
	keepAliveInitialDelay: 0
}) as ExecutablePool

export default db
