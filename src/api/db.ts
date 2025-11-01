import "dotenv/config"
import mysql from "mysql2/promise"
import type { Pool } from "mysql2/promise"

const isProd = process.env.NODE_ENV === "production"

export const db = mysql.createPool({
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
}) as Pool & {
	execute: <T = any>(sql: string, values?: any[]) => Promise<[T[], any]>
}

export default db
