import express from "express"
import cors from "cors"
import { getDb, migrate } from "./db.js"
import { validateCustomer, validateAddress } from "./validation.js"

export const app = express()

export async function initDb() {
  await migrate()
}

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// health
app.get("/api/health", (_, res) => {
  res.json({ ok: true })
})

// helper to build sorting safely
const CUSTOMER_SORT_COLUMNS = new Set(["first_name", "last_name", "phone_number", "id", "address_count"])
function buildCustomerListQuery({ q, city, state, pin_code, sortBy, sortOrder, limit, offset }) {
  // We compute address_count with a LEFT JOIN subquery
  const base = `
    FROM customers c
    LEFT JOIN (
      SELECT customer_id, COUNT(*) AS address_count
      FROM addresses
      GROUP BY customer_id
    ) a ON a.customer_id = c.id
  `

  const where = []
  const params = []

  if (q) {
    where.push("(c.first_name LIKE ? OR c.last_name LIKE ? OR c.phone_number LIKE ?)")
    const like = `%${q}%`
    params.push(like, like, like)
  }

  // filters by address attributes require EXISTS on addresses
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

  const orderCol = CUSTOMER_SORT_COLUMNS.has(sortBy || "") ? sortBy : "id"
  const orderDir = (sortOrder || "asc").toLowerCase() === "desc" ? "DESC" : "ASC"
  const orderSql = `ORDER BY ${orderCol} ${orderDir}`

  const pageSql = `LIMIT ? OFFSET ?`
  params.push(limit, offset)

  const dataSql = `
    SELECT c.id, c.first_name, c.last_name, c.phone_number, IFNULL(a.address_count, 0) AS address_count
    ${base}
    ${whereSql}
    ${orderSql}
    ${pageSql}
  `

  const countSql = `
    SELECT COUNT(*) as total
    ${base}
    ${whereSql}
  `

  return { dataSql, countSql, params, countParams: params.slice(0, params.length - 2) }
}

// Customers: Create
app.post("/api/customers", async (req, res) => {
  try {
    const { valid, errors } = validateCustomer(req.body)
    if (!valid) return res.status(400).json({ errors })

    const db = await getDb()
    const { first_name, last_name, phone_number } = req.body

    const stmt = `INSERT INTO customers (first_name, last_name, phone_number) VALUES (?, ?, ?)`
    await db.runAsync(stmt, [first_name.trim(), last_name.trim(), String(phone_number).trim()])

    const row = await db.getAsync(`SELECT last_insert_rowid() as id`)
    const created = await db.getAsync(`SELECT id, first_name, last_name, phone_number FROM customers WHERE id = ?`, [
      row.id,
    ])
    res.status(201).json(created)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to create customer" })
  }
})

// Customers: List (search, sort, pagination, filters)
app.get("/api/customers", async (req, res) => {
  try {
    const {
      q = "",
      city = "",
      state = "",
      pin_code = "",
      sortBy = "id",
      sortOrder = "asc",
      page = "1",
      pageSize = "10",
    } = req.query

    const limit = Math.max(1, Math.min(100, Number.parseInt(pageSize, 10) || 10))
    const currentPage = Math.max(1, Number.parseInt(page, 10) || 1)
    const offset = (currentPage - 1) * limit

    const db = await getDb()
    const { dataSql, countSql, params, countParams } = buildCustomerListQuery({
      q: q ? String(q).trim() : "",
      city: city ? String(city).trim() : "",
      state: state ? String(state).trim() : "",
      pin_code: pin_code ? String(pin_code).trim() : "",
      sortBy: String(sortBy),
      sortOrder: String(sortOrder),
      limit,
      offset,
    })

    const [items, countRow] = await Promise.all([db.allAsync(dataSql, params), db.getAsync(countSql, countParams)])

    const customers = items.map((c) => ({
      ...c,
      onlyOneAddress: Number(c.address_count) === 1,
    }))

    res.json({
      data: customers,
      pagination: {
        total: countRow?.total ?? 0,
        page: currentPage,
        pageSize: limit,
        totalPages: Math.ceil((countRow?.total ?? 0) / limit),
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to list customers" })
  }
})

// Customers: Read by ID
app.get("/api/customers/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    const db = await getDb()

    const row = await db.getAsync(
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

    if (!row) return res.status(404).json({ error: "Customer not found" })

    res.json({
      ...row,
      onlyOneAddress: Number(row.address_count) === 1,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to get customer" })
  }
})

// Customers: Update
app.put("/api/customers/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { valid, errors } = validateCustomer(req.body)
    if (!valid) return res.status(400).json({ errors })

    const db = await getDb()
    const { first_name, last_name, phone_number } = req.body

    const existing = await db.getAsync(`SELECT id FROM customers WHERE id = ?`, [id])
    if (!existing) return res.status(404).json({ error: "Customer not found" })

    await db.runAsync(`UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?`, [
      first_name.trim(),
      last_name.trim(),
      String(phone_number).trim(),
      id,
    ])

    const updated = await db.getAsync(`SELECT id, first_name, last_name, phone_number FROM customers WHERE id = ?`, [
      id,
    ])
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to update customer" })
  }
})

// Customers: Delete (cascade addresses)
app.delete("/api/customers/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    const db = await getDb()
    const existing = await db.getAsync(`SELECT id FROM customers WHERE id = ?`, [id])
    if (!existing) return res.status(404).json({ error: "Customer not found" })

    await db.runAsync(`DELETE FROM customers WHERE id = ?`, [id])
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to delete customer" })
  }
})

// Addresses: Add address
app.post("/api/customers/:id/addresses", async (req, res) => {
  try {
    const customerId = Number(req.params.id)
    const { valid, errors } = validateAddress(req.body)
    if (!valid) return res.status(400).json({ errors })

    const db = await getDb()
    const cust = await db.getAsync(`SELECT id FROM customers WHERE id = ?`, [customerId])
    if (!cust) return res.status(404).json({ error: "Customer not found" })

    const { address_details, city, state, pin_code } = req.body

    await db.runAsync(
      `INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)`,
      [customerId, address_details.trim(), city.trim(), state.trim(), String(pin_code).trim()],
    )
    const row = await db.getAsync(`SELECT last_insert_rowid() as id`)
    const created = await db.getAsync(`SELECT * FROM addresses WHERE id = ?`, [row.id])

    res.status(201).json(created)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to add address" })
  }
})

// Addresses: List by customer with filters
app.get("/api/customers/:id/addresses", async (req, res) => {
  try {
    const customerId = Number(req.params.id)
    const { city = "", state = "", pin_code = "" } = req.query
    const db = await getDb()

    const where = [`customer_id = ?`]
    const params = [customerId]

    if (city) {
      where.push(`city LIKE ?`)
      params.push(`%${String(city).trim()}%`)
    }
    if (state) {
      where.push(`state LIKE ?`)
      params.push(`%${String(state).trim()}%`)
    }
    if (pin_code) {
      where.push(`pin_code LIKE ?`)
      params.push(`%${String(pin_code).trim()}%`)
    }

    const rows = await db.allAsync(`SELECT * FROM addresses WHERE ${where.join(" AND ")} ORDER BY id DESC`, params)

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to list addresses" })
  }
})

// Addresses: Update
app.put("/api/addresses/:addressId", async (req, res) => {
  try {
    const addressId = Number(req.params.addressId)
    const { valid, errors } = validateAddress(req.body)
    if (!valid) return res.status(400).json({ errors })

    const db = await getDb()
    const existing = await db.getAsync(`SELECT * FROM addresses WHERE id = ?`, [addressId])
    if (!existing) return res.status(404).json({ error: "Address not found" })

    const { address_details, city, state, pin_code } = req.body
    await db.runAsync(`UPDATE addresses SET address_details = ?, city = ?, state = ?, pin_code = ? WHERE id = ?`, [
      address_details.trim(),
      city.trim(),
      state.trim(),
      String(pin_code).trim(),
      addressId,
    ])

    const updated = await db.getAsync(`SELECT * FROM addresses WHERE id = ?`, [addressId])
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to update address" })
  }
})

// Addresses: Delete
app.delete("/api/addresses/:addressId", async (req, res) => {
  try {
    const addressId = Number(req.params.addressId)
    const db = await getDb()
    const existing = await db.getAsync(`SELECT id FROM addresses WHERE id = ?`, [addressId])
    if (!existing) return res.status(404).json({ error: "Address not found" })

    await db.runAsync(`DELETE FROM addresses WHERE id = ?`, [addressId])
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to delete address" })
  }
})
