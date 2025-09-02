"use client"

import { useState, useEffect } from "react"
import { validateCustomer } from "../validation.js"

export default function CustomerForm({ initialValues, onSubmit, submitting }) {
  const [values, setValues] = useState({ first_name: "", last_name: "", phone_number: "" })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setValues({
      first_name: initialValues?.first_name || "",
      last_name: initialValues?.last_name || "",
      phone_number: initialValues?.phone_number || "",
    })
  }, [initialValues])

  function handleChange(e) {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validateCustomer(values)
    setErrors(errs)
    if (Object.keys(errs).length === 0) {
      onSubmit(values)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="row row-2">
        <div>
          <label className="label" htmlFor="first_name">
            First name
          </label>
          <input
            id="first_name"
            name="first_name"
            className="input"
            value={values.first_name}
            onChange={handleChange}
          />
          {errors.first_name && <div className="error">{errors.first_name}</div>}
        </div>
        <div>
          <label className="label" htmlFor="last_name">
            Last name
          </label>
          <input id="last_name" name="last_name" className="input" value={values.last_name} onChange={handleChange} />
          {errors.last_name && <div className="error">{errors.last_name}</div>}
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <label className="label" htmlFor="phone_number">
          Phone number
        </label>
        <input
          id="phone_number"
          name="phone_number"
          className="input"
          value={values.phone_number}
          onChange={handleChange}
        />
        {errors.phone_number && <div className="error">{errors.phone_number}</div>}
      </div>
      <div style={{ marginTop: 16 }}>
        <button className="btn" disabled={!!submitting} type="submit">
          {submitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  )
}
