"use client"

import { useState, useEffect } from "react"
import { validateAddress } from "../validation.js"

export default function AddressForm({ initialValues, onSubmit, submitting }) {
  const [values, setValues] = useState({
    address_details: "",
    city: "",
    state: "",
    pin_code: "",
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setValues({
      address_details: initialValues?.address_details || "",
      city: initialValues?.city || "",
      state: initialValues?.state || "",
      pin_code: initialValues?.pin_code || "",
    })
  }, [initialValues])

  function handleChange(e) {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validateAddress(values)
    setErrors(errs)
    if (Object.keys(errs).length === 0) onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="row">
        <div>
          <label className="label" htmlFor="address_details">
            Address
          </label>
          <textarea
            id="address_details"
            name="address_details"
            className="textarea"
            rows={3}
            value={values.address_details}
            onChange={handleChange}
          />
          {errors.address_details && <div className="error">{errors.address_details}</div>}
        </div>
      </div>
      <div className="row row-3" style={{ marginTop: 12 }}>
        <div>
          <label className="label" htmlFor="city">
            City
          </label>
          <input id="city" name="city" className="input" value={values.city} onChange={handleChange} />
          {errors.city && <div className="error">{errors.city}</div>}
        </div>
        <div>
          <label className="label" htmlFor="state">
            State
          </label>
          <input id="state" name="state" className="input" value={values.state} onChange={handleChange} />
          {errors.state && <div className="error">{errors.state}</div>}
        </div>
        <div>
          <label className="label" htmlFor="pin_code">
            PIN Code
          </label>
          <input id="pin_code" name="pin_code" className="input" value={values.pin_code} onChange={handleChange} />
          {errors.pin_code && <div className="error">{errors.pin_code}</div>}
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <button className="btn" disabled={!!submitting} type="submit">
          {submitting ? "Saving..." : "Save Address"}
        </button>
      </div>
    </form>
  )
}
