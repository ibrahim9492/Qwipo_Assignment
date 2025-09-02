export function validateCustomer(body: any) {
  const errors: Record<string, string> = {}
  const first = String(body?.first_name || "").trim()
  const last = String(body?.last_name || "").trim()
  const phone = String(body?.phone_number || "").trim()

  if (!first) errors.first_name = "First name is required"
  if (!last) errors.last_name = "Last name is required"
  if (!phone) {
    errors.phone_number = "Phone number is required"
  } else if (!/^\d{10}$/.test(phone)) {
    errors.phone_number = "Phone number must be 10 digits"
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateAddress(body: any) {
  const errors: Record<string, string> = {}
  const details = String(body?.address_details || "").trim()
  const city = String(body?.city || "").trim()
  const state = String(body?.state || "").trim()
  const pin = String(body?.pin_code || "").trim()

  if (!details) errors.address_details = "Address details are required"
  if (!city) errors.city = "City is required"
  if (!state) errors.state = "State is required"
  if (!pin) {
    errors.pin_code = "PIN is required"
  } else if (!/^\d{4,8}$/.test(pin)) {
    // allow 4-8 digits to be flexible; tighten to 6 if needed
    errors.pin_code = "PIN must be numeric"
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
