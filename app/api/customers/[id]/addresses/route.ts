import { type NextRequest, NextResponse } from "next/server"
import { all, get, getDb, run } from "@/lib/sqlite"
import { validateAddress } from "@/lib/validation"
import { logger } from "@/lib/logger"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = Number(params.id)

    const city = (searchParams.get("city") || "").trim()
    const state = (searchParams.get("state") || "").trim()
    const pin_code = (searchParams.get("pin_code") || "").trim()

    const where: string[] = [`customer_id = ?`]
    const p: any[] = [customerId]

    if (city) {
      where.push(`city LIKE ?`)
      p.push(`%${city}%`)
    }
    if (state) {
      where.push(`state LIKE ?`)
      p.push(`%${state}%`)
    }
    if (pin_code) {
      where.push(`pin_code LIKE ?`)
      p.push(`%${pin_code}%`)
    }

    const db = await getDb()
    const rows = await all<any>(db, `SELECT * FROM addresses WHERE ${where.join(" AND ")} ORDER BY id DESC`, p)
    return NextResponse.json(rows)
  } catch (err: any) {
    logger.error(err?.message || "Failed to list addresses")
    return NextResponse.json({ error: "Failed to list addresses" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customerId = Number(params.id)
    const body = await req.json()
    const { valid, errors } = validateAddress(body)
    if (!valid) return NextResponse.json({ errors }, { status: 400 })

    const db = await getDb()
    const cust = await get<{ id: number }>(db, `SELECT id FROM customers WHERE id = ?`, [customerId])
    if (!cust) return NextResponse.json({ error: "Customer not found" }, { status: 404 })

    const details = String(body.address_details).trim()
    const city = String(body.city).trim()
    const state = String(body.state).trim()
    const pin = String(body.pin_code).trim()

    await run(
      db,
      `INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)`,
      [customerId, details, city, state, pin],
    )

    const row = await get<{ id: number }>(db, `SELECT last_insert_rowid() as id`)
    const created = await get<any>(db, `SELECT * FROM addresses WHERE id = ?`, [row?.id])
    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    logger.error(err?.message || "Failed to add address")
    return NextResponse.json({ error: "Failed to add address" }, { status: 500 })
  }
}
