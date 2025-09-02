import { type NextRequest, NextResponse } from "next/server"
import { get, getDb, run } from "@/lib/sqlite"
import { validateCustomer } from "@/lib/validation"
import { logger } from "@/lib/logger"

export const dynamic = "force-dynamic"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const db = await getDb()
    const row = await get<any>(
      db,
      `
      SELECT c.id, c.first_name, c.last_name, c.phone_number, IFNULL(a.address_count, 0) AS address_count
      FROM customers c
      LEFT JOIN (
        SELECT customer_id, COUNT(*) AS address_count
        FROM addresses
        GROUP BY customer_id
      ) a ON a.customer_id = c.id
      WHERE c.id = ?
    `,
      [id],
    )
    if (!row) return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    return NextResponse.json({ ...row, onlyOneAddress: Number(row.address_count) === 1 })
  } catch (err: any) {
    logger.error(err?.message || "Failed to get customer")
    return NextResponse.json({ error: "Failed to get customer" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const body = await req.json()
    const { valid, errors } = validateCustomer(body)
    if (!valid) return NextResponse.json({ errors }, { status: 400 })

    const db = await getDb()
    const exists = await get<{ id: number }>(db, `SELECT id FROM customers WHERE id = ?`, [id])
    if (!exists) return NextResponse.json({ error: "Customer not found" }, { status: 404 })

    const first = String(body.first_name).trim()
    const last = String(body.last_name).trim()
    const phone = String(body.phone_number).trim()

    const dup = await get<{ id: number }>(db, `SELECT id FROM customers WHERE phone_number = ? AND id <> ?`, [
      phone,
      id,
    ])
    if (dup) return NextResponse.json({ error: "Phone number already exists" }, { status: 400 })

    await run(db, `UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?`, [
      first,
      last,
      phone,
      id,
    ])
    const updated = await get<any>(db, `SELECT id, first_name, last_name, phone_number FROM customers WHERE id = ?`, [
      id,
    ])
    return NextResponse.json(updated)
  } catch (err: any) {
    logger.error(err?.message || "Failed to update customer")
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const db = await getDb()
    const exists = await get<{ id: number }>(db, `SELECT id FROM customers WHERE id = ?`, [id])
    if (!exists) return NextResponse.json({ error: "Customer not found" }, { status: 404 })

    await run(db, `DELETE FROM customers WHERE id = ?`, [id])
    return new NextResponse(null, { status: 204 })
  } catch (err: any) {
    logger.error(err?.message || "Failed to delete customer")
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}
