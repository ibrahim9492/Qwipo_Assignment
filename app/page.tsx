"use client"
export const dynamic = "force-static"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type CustomerRow = {
  id: number
  first_name: string
  last_name: string
  phone_number: string
  address_count: number
  onlyOneAddress: boolean
}

export default function Page() {
  const [previewRows, setPreviewRows] = useState<CustomerRow[]>([
    { id: 1, first_name: "Jane", last_name: "Doe", phone_number: "555-1234", address_count: 1, onlyOneAddress: true },
    {
      id: 2,
      first_name: "John",
      last_name: "Smith",
      phone_number: "555-9876",
      address_count: 3,
      onlyOneAddress: false,
    },
  ])
  const [lastSaved, setLastSaved] = useState<null | { first_name: string; last_name: string }>(null)

  const [form, setForm] = useState({ first_name: "", last_name: "", phone_number: "" })

  function handlePreviewCreate(values: { first_name: string; last_name: string; phone_number: string }) {
    const next: CustomerRow = {
      id: previewRows.length ? Math.max(...previewRows.map((r) => r.id)) + 1 : 1,
      first_name: values.first_name,
      last_name: values.last_name,
      phone_number: values.phone_number,
      address_count: 0,
      onlyOneAddress: false,
    }
    setPreviewRows((prev) => [next, ...prev])
    setLastSaved({ first_name: values.first_name, last_name: values.last_name })
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.first_name.trim() || !form.last_name.trim()) return
    handlePreviewCreate(form)
    setForm({ first_name: "", last_name: "", phone_number: "" })
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-balance">Customer Management App</h1>
        <p className="text-sm text-muted-foreground text-pretty">
          This is a lightweight preview of core UI components. The full app runs in <code>/client</code> (React Router +
          Axios) and the API is in <code>/server</code> (Express + SQLite).
        </p>
      </header>

      {/* Customer List Preview */}
      <section className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview: Customer List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>First name</TableHead>
                    <TableHead>Last name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Addresses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.id}</TableCell>
                      <TableCell>{r.first_name}</TableCell>
                      <TableCell>{r.last_name}</TableCell>
                      <TableCell>{r.phone_number}</TableCell>
                      <TableCell className="text-right">{r.address_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Customer Form Preview */}
      <section className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview: Customer Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First name</Label>
                  <Input
                    id="first_name"
                    value={form.first_name}
                    onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                    placeholder="Jane"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last name</Label>
                  <Input
                    id="last_name"
                    value={form.last_name}
                    onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                    placeholder="Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone</Label>
                  <Input
                    id="phone_number"
                    value={form.phone_number}
                    onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
                    placeholder="555-1234"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit">Save preview customer</Button>
                {lastSaved ? (
                  <span className="text-sm text-emerald-600">
                    Saved: {lastSaved.first_name} {lastSaved.last_name}
                  </span>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Next steps */}
      <section className="space-y-2">
        <h3 className="text-base font-medium">Next steps</h3>
        <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
          <li>
            Run the backend locally: from <code>/server</code> start <code>node server.js</code> (port 4000).
          </li>
          <li>
            Run the frontend locally: from <code>/client</code> start <code>vite</code> and visit{" "}
            {"http://localhost:5173"}.
          </li>
          <li>
            Set <code>VITE_API_BASE_URL</code> in the client for your deployed server URL when publishing.
          </li>
        </ol>
      </section>
    </div>
  )
}
