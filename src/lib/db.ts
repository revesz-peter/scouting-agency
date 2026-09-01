import { neon } from "@neondatabase/serverless"

/**
 * Pooled connection for application queries. Migrations use the unpooled URL
 * (DATABASE_URL_UNPOOLED) and run through psql, not from here.
 *
 * Tagged-template calls are parameterised, so interpolated values are never
 * concatenated into SQL:
 *
 *   const rows = await sql`SELECT id FROM application WHERE email = ${email}`
 *
 * Note that neon_auth columns are camelCase and must be double-quoted:
 *
 *   sql`SELECT "emailVerified" FROM neon_auth."user" WHERE id = ${userId}`
 */
export const sql = neon(process.env.DATABASE_URL!)
