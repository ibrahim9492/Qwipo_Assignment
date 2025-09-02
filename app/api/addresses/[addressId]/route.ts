import { type NextRequest, NextResponse } from "next/server"
import { get, getDb, run } from "@/lib/sqlite"
import { validateAddress } from "@/lib/validation"
import { logger } from "@/lib/logger"

export const dynamic = "force-dynamic"

export async function PUT(req: NextRequest, { params }: { params: { addressId: string } }) {
  try {
    const addressId = Number(params.addressId)
    const body = await req.json()
    const { valid, errors } = validateAddress(body)
    if (!valid) return NextResponse.json({ errors }, { status: 400 })

    const db = await getDb()
    const existing = await get<any>(db, `SELECT * FROM addresses WHERE id = ?`, [addressId])
    if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 })

    const details = String(body.address_details).trim()
    const city = String(body.city).trim()
    const state = String(body.state).trim()
    const pin = String(body.pin_code).trim()

    await run(db, `UPDATE addresses SET address_details = ?, city = ?, state = ?, pin_code = ? WHERE id = ?`, [
      details,
      city,
      state,
      pin,
      addressId,
    ])
    const updated = await get<any>(db, `SELECT * FROM addresses WHERE id = ?`, [addressId])
    return NextResponse.json(updated)
  } catch (err: any) {
    logger.error(err?.message || "Failed to update address")
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { addressId: string } }) {
  try {
    const addressId = Number(params.addressId)
    const db = await getDb()
    const existing = await get<{ id: number }>(db, `SELECT id FROM addresses WHERE id = ?`, [addressId])
    if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 })

    await run(db, `DELETE FROM addresses WHERE id = ?`, [addressId])
    return new NextResponse(null, { status: 204 })
  } catch (err: any) {
    logger.error(err?.message || "Failed to delete address")
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
  }
}
