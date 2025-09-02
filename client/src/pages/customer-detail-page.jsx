"use client"

import { useEffect, useMemo, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { api, toQuery } from "../api.js"
import AddressList from "../components/address-list.jsx"
import AddressForm from "../components/address-form.jsx"

export default function CustomerDetailPage() {
  const { id } = useParams()
  const [sp, setSp] = useSearchParams()
  const [customer, setCustomer] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [addrLoading, setAddrLoading] = useState(false)

  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const city = sp.get("city") || ""
  const state = sp.get("state") || ""
  const pin_code = sp.get("pin_code") || ""

  const addrParams = useMemo(() => ({ city, state, pin_code }), [city, state, pin_code])

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      try {
        const { data } = await api.get(`/api/customers/${id}`)
        if (alive) setCustomer(data)
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
  }, [id])

  useEffect(() => {
    let alive = true
    async function loadAddresses() {
      setAddrLoading(true)
      try {
        const { data } = await api.get(`/api/customers/${id}/addresses${toQuery(addrParams)}`)
        if (alive) setAddresses(data)
      } catch (e) {
        console.error(e)
      } finally {
        if (alive) setAddrLoading(false)
      }
    }
    loadAddresses()
    return () => {
      alive = false
    }
  }, [id, addrParams])

  function updateFilter(next) {
    const obj = Object.fromEntries(sp.entries())
    setSp({ ...obj, ...next }, { replace: true })
  }

  async function handleDeleteCustomer() {
    if (!confirm("Delete this customer and all addresses?")) return
    try {
      await api.delete(`/api/customers/${id}`)
      window.location.href = "/"
    } catch (e) {
      alert("Failed to delete")
    }
  }

  async function handleCreateAddress(values) {
    setSubmitting(true)
    setError("")
    try {
      await api.post(`/api/customers/${id}/addresses`, values)
      setEditing(null)
      // refresh
      const { data } = await api.get(`/api/customers/${id}/addresses${toQuery(addrParams)}`)
      setAddresses(data)
    } catch (e) {
      console.error(e)
      setError(e?.response?.data?.errors ? JSON.stringify(e.response.data.errors) : "Failed to save address")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdateAddress(values) {
    setSubmitting(true)
    setError("")
    try {
      await api.put(`/api/addresses/${editing.id}`, values)
      setEditing(null)
      const { data } = await api.get(`/api/customers/${id}/addresses${toQuery(addrParams)}`)
      setAddresses(data)
    } catch (e) {
      console.error(e)
      setError(e?.response?.data?.errors ? JSON.stringify(e.response.data.errors) : "Failed to update address")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteAddress(address) {
    if (!confirm("Delete this address?")) return
    try {
      await api.delete(`/api/addresses/${address.id}`)
      const { data } = await api.get(`/api/customers/${id}/addresses${toQuery(addrParams)}`)
      setAddresses(data)
    } catch (e) {
      alert("Failed to delete address")
    }
  }

  if (loading) return <div className="card">Loading...</div>
  if (!customer) return <div className="card">Customer not found</div>

  return (
    <div className="grid">
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div>
            <h2 className="text-pretty">
              {customer.first_name} {customer.last_name}
            </h2>
            <div className="helper">Phone: {customer.phone_number}</div>
            <div style={{ marginTop: 6 }}>
              <span className="badge">Addresses: {customer.address_count}</span>{" "}
              {customer.onlyOneAddress && <span className="badge green">Only One Address</span>}
            </div>
          </div>
          <div>
            <Link className="btn" to={`/customers/${customer.id}/edit`}>
              Edit
            </Link>
            <button className="btn danger" style={{ marginLeft: 8 }} onClick={handleDeleteCustomer}>
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Filter Addresses</h3>
        <div className="toolbar" style={{ marginTop: 8 }}>
          <div>
            <label className="label">City</label>
            <input className="input" value={city} onChange={(e) => updateFilter({ city: e.target.value })} />
          </div>
          <div>
            <label className="label">State</label>
            <input className="input" value={state} onChange={(e) => updateFilter({ state: e.target.value })} />
          </div>
          <div>
            <label className="label">PIN</label>
            <input className="input" value={pin_code} onChange={(e) => updateFilter({ pin_code: e.target.value })} />
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button className="btn" onClick={() => setEditing({})}>
              Add Address
            </button>
          </div>
        </div>
      </div>

      {addrLoading ? (
        <div className="card">Loading addresses...</div>
      ) : (
        <AddressList rows={addresses} onEdit={setEditing} onDelete={handleDeleteAddress} />
      )}

      {editing !== null && (
        <div className="card">
          <h3>{editing?.id ? "Edit Address" : "Add Address"}</h3>
          {error && (
            <div className="error" style={{ marginBottom: 8 }}>
              {error}
            </div>
          )}
          <AddressForm
            initialValues={editing?.id ? editing : {}}
            onSubmit={editing?.id ? handleUpdateAddress : handleCreateAddress}
            submitting={submitting}
          />
          <div style={{ marginTop: 8 }}>
            <button className="btn secondary" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
