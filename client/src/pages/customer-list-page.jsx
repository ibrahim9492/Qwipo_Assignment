"use client"

import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { api, toQuery } from "../api.js"
import CustomerList from "../components/customer-list.jsx"

const DEFAULT_PAGE_SIZE = 10

export default function CustomerListPage() {
  const [sp, setSp] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0, totalPages: 1 })

  const q = sp.get("q") || ""
  const city = sp.get("city") || ""
  const state = sp.get("state") || ""
  const pin_code = sp.get("pin_code") || ""
  const sortBy = sp.get("sortBy") || "id"
  const sortOrder = sp.get("sortOrder") || "asc"
  const page = Number(sp.get("page") || 1)
  const pageSize = Number(sp.get("pageSize") || DEFAULT_PAGE_SIZE)

  const params = useMemo(
    () => ({ q, city, state, pin_code, sortBy, sortOrder, page, pageSize }),
    [q, city, state, pin_code, sortBy, sortOrder, page, pageSize],
  )

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      try {
        const url = `/api/customers${toQuery(params)}`
        const { data } = await api.get(url)
        if (!alive) return
        setRows(data.data)
        setPagination(data.pagination)
      } catch (e) {
        console.error(e)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [params])

  function updateSp(next) {
    const obj = Object.fromEntries(sp.entries())
    const merged = { ...obj, ...next, page: 1 } // reset to page 1 on filter change
    setSp(merged, { replace: true })
  }

  function goToPage(p) {
    const obj = Object.fromEntries(sp.entries())
    setSp({ ...obj, page: p }, { replace: true })
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="toolbar">
          <div className="grow">
            <label className="label" htmlFor="q">
              Search (name/phone)
            </label>
            <input
              id="q"
              className="input"
              placeholder="e.g. Jane, 555..."
              value={q}
              onChange={(e) => updateSp({ q: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="city">
              City
            </label>
            <input id="city" className="input" value={city} onChange={(e) => updateSp({ city: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="state">
              State
            </label>
            <input id="state" className="input" value={state} onChange={(e) => updateSp({ state: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="pin_code">
              PIN
            </label>
            <input
              id="pin_code"
              className="input"
              value={pin_code}
              onChange={(e) => updateSp({ pin_code: e.target.value })}
            />
          </div>
        </div>

        <div className="toolbar" style={{ marginTop: 12 }}>
          <div>
            <label className="label">Sort by</label>
            <div style={{ display: "flex", gap: 8 }}>
              <select className="select" value={sortBy} onChange={(e) => updateSp({ sortBy: e.target.value })}>
                <option value="id">ID</option>
                <option value="first_name">First name</option>
                <option value="last_name">Last name</option>
                <option value="phone_number">Phone</option>
                <option value="address_count">Addresses</option>
              </select>
              <select className="select" value={sortOrder} onChange={(e) => updateSp({ sortOrder: e.target.value })}>
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Link className="btn" to="/customers/new">
              Add Customer
            </Link>
          </div>
        </div>
      </div>

      {loading ? <div className="card">Loading...</div> : <CustomerList rows={rows} />}

      <div className="card">
        <div className="pagination">
          <button
            className="btn secondary"
            disabled={pagination.page <= 1}
            onClick={() => goToPage(pagination.page - 1)}
          >
            Prev
          </button>
          <div>
            Page {pagination.page} of {pagination.totalPages} • Total {pagination.total}
          </div>
          <button
            className="btn secondary"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => goToPage(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
