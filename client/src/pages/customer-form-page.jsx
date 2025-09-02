"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { api } from "../api.js"
import CustomerForm from "../components/customer-form.jsx"

export default function CustomerFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const isEdit = !!id
  const [initial, setInitial] = useState(null)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const { data } = await api.get(`/api/customers/${id}`)
        if (alive) setInitial(data)
      } catch (e) {
        setError("Failed to load customer")
      } finally {
        if (alive) setLoading(false)
      }
    }
    if (isEdit) load()
    return () => {
      alive = false
    }
  }, [id, isEdit])

  async function handleSubmit(values) {
    setSaving(true)
    setError("")
    try {
      if (isEdit) {
        await api.put(`/api/customers/${id}`, values)
      } else {
        const { data } = await api.post(`/api/customers`, values)
        return navigate(`/customers/${data.id}`)
      }
      navigate(`/customers/${id}`)
    } catch (e) {
      console.error(e)
      setError(e?.response?.data?.errors ? JSON.stringify(e.response.data.errors) : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="card">Loading...</div>
  if (error) return <div className="card error">{error}</div>

  return (
    <div className="grid">
      <h2>{isEdit ? "Edit Customer" : "New Customer"}</h2>
      <CustomerForm initialValues={initial} onSubmit={handleSubmit} submitting={saving} />
    </div>
  )
}
