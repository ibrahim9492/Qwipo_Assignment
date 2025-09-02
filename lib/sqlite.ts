import sqlite3 from "sqlite3"
import path from "node:path"
import fs from "node:fs"

sqlite3.verbose()

type DB = sqlite3.Database

let dbPromise: Promise<DB> | null = null

function promisify<T>(fn: Function, ctx: any) {
  return (...args: any[]) =>
    new Promise<T>((resolve, reject) => {
      fn.call(ctx, ...args, function (this: any, err: Error, result: T) {
        if (err) return reject(err)
        resolve(result)
      })
    })
}

async function migrate(db: DB) {
  // Enable FKs
  await run(db, `PRAGMA foreign_keys = ON;`)
  // Create tables
  await run(
    db,
    `
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone_number TEXT NOT NULL UNIQUE
    );
  `,
  )
  await run(
    db,
    `
    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      address_details TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pin_code TEXT NOT NULL,
      FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );
  `,
  )
}

export async function getDb(): Promise<DB> {
  if (!dbPromise) {
    dbPromise = new Promise<DB>((resolve, reject) => {
      const dbPath = process.env.SQLITE_PATH || path.join("/tmp", "database.sqlite")
      try {
        const dir = path.dirname(dbPath)
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }
      } catch {
        // ignore
      }
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) return reject(err)
        resolve(db)
      })
    }).then(async (db) => {
      await migrate(db)
      return db
    })
  }
  return dbPromise
}

export async function run(db: DB, sql: string, params: any[] = []) {
  const exec = promisify<void>(db.run, db)
  await exec(sql, params)
}

export async function get<T = any>(db: DB, sql: string, params: any[] = []) {
  const exec = promisify<T>(db.get, db)
  return exec(sql, params)
}

export async function all<T = any>(db: DB, sql: string, params: any[] = []) {
  const exec = promisify<T[]>(db.all, db)
  return exec(sql, params)
}
