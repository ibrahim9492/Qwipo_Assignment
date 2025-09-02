import fs from "node:fs"
import path from "node:path"
import sqlite3 from "sqlite3"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = process.env.SQLITE_DATA_DIR || path.join(__dirname, "..", "data")
const DB_PATH = process.env.SQLITE_PATH || path.join(DATA_DIR, "database.sqlite")

let db

export async function getDb() {
  if (db) return db

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  sqlite3.verbose()
  db = new sqlite3.Database(DB_PATH)
  // promisify
  db.runAsync = promisify(db.run.bind(db))
  db.getAsync = promisify(db.get.bind(db))
  db.allAsync = promisify(db.all.bind(db))

  // enforce foreign keys
  await db.runAsync("PRAGMA foreign_keys = ON;")

  return db
}

export async function migrate() {
  const db = await getDb()

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone_number TEXT NOT NULL
    );
  `)

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      address_details TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pin_code TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );
  `)
}
