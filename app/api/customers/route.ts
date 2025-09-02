import { type NextRequest, NextResponse } from "next/server"
import { all, get, getDb, run } from "@/lib/sqlite"
import { validateCustomer } from "@/lib/validation"
import { logger } from "@/lib/logger"

export const dynamic = "force-dynamic"

const SORT_COLUMNS = new Set(["id", "first_name", "last_name", "phone_number", "address_count"])

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get("q") || "").trim()
    const city = (searchParams.get("city") || "").trim()
    const state = (searchParams.get("state") || "").trim()
    const pin_code = (searchParams.get("pin_code") || "").trim()
    const sortBy = searchParams.get("sortBy") || "id"
    const sortOrder = (searchParams.get("sortOrder") || "asc").toLowerCase() === "desc" ? "DESC" : "ASC"
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1)
    const pageSize = Math.max(1, Math.min(100, Number.parseInt(searchParams.get("pageSize") || "10", 10) || 10))
    const offset = (page - 1) * pageSize

    const orderCol = SORT_COLUMNS.has(sortBy) ? sortBy : "id"

    const base = `
      FROM customers c
      LEFT JOIN (
        SELECT customer_id, COUNT(*) AS address_count
        FROM addresses
        GROUP BY customer_id
      ) a ON a.customer_id = c.id
    `

    const where: string[] = []
    const params: any[] = []

    if (q) {
      where.push("(c.first_name LIKE ? OR c.last_name LIKE ? OR c.phone_number LIKE ?)")
      const like = `%${q}%`
      params.push(like, like, like)
    }
    if (city) {
      where.push(`EXISTS (SELECT 1 FROM addresses ad WHERE ad.customer_id = c.id AND ad.city LIKE ?)`)
      params.push(`%${city}%`)
    }
    if (state) {
      where.push(`EXISTS (SELECT 1 FROM addresses ad WHERE ad.customer_id = c.id AND ad.state LIKE ?)`)
      params.push(`%${state}%`)
    }
    if (pin_code) {
      where.push(`EXISTS (SELECT 1 FROM addresses ad WHERE ad.customer_id = c.id AND ad.pin_code LIKE ?)`)
      params.push(`%${pin_code}%`)
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : ""
    const orderSql = `ORDER BY ${orderCol} ${sortOrder}`

    const dataSql = `
      SELECT c.id, c.first_name, c.last_name, c.phone_number, IFNULL(a.address_count, 0) AS address_count
      ${base}
      ${whereSql}
      ${orderSql}
      LIMIT ? OFFSET ?
    `
    const countSql = `
      SELECT COUNT(*) as total
      ${base}
      ${whereSql}
    `

    const db = await getDb()
    const items = await all<any>(db, dataSql, [...params, pageSize, offset])
    const countRow = await get<{ total: number }>(db, countSql, params)

    const data = items.map((c) => ({ ...c, onlyOneAddress: Number(c.address_count) === 1 }))
    const total = Number(countRow?.total || 0)

    return NextResponse.json({
      data,
      pagination: { total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    })
  } catch (err: any) {
    logger.error(err?.message || "Failed to list customers")
    return NextResponse.json({ error: "Failed to list customers" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { valid, errors } = validateCustomer(body)
    if (!valid) return NextResponse.json({ errors }, { status: 400 })

    const db = await getDb()
    const first = String(body.first_name).trim()
    const last = String(body.last_name).trim()
    const phone = String(body.phone_number).trim()

    // Duplicate phone check
    const dup = await get<{ id: number }>(db, `SELECT id FROM customers WHERE phone_number = ?`, [phone])
    if (dup) {
      return NextResponse.json({ error: "Phone number already exists" }, { status: 400 })
    }

    await run(db, `INSERT INTO customers (first_name, last_name, phone_number) VALUES (?, ?, ?)`, [first, last, phone])
    const row = await get<{ id: number }>(db, `SELECT last_insert_rowid() AS id`)
    const created = await get<any>(db, `SELECT id, first_name, last_name, phone_number FROM customers WHERE id = ?`, [
      row?.id,
    ])
    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    logger.error(err?.message || "Failed to create customer")
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
