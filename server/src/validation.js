export function validateCustomer(payload) {
  const errors = {}
  if (!payload || typeof payload !== "object") {
    return { valid: false, errors: { _root: "Invalid payload" } }
  }
  const { first_name, last_name, phone_number } = payload

  if (!first_name || String(first_name).trim().length < 2) {
    errors.first_name = "First name is required (min 2 chars)"
  }
  if (!last_name || String(last_name).trim().length < 2) {
    errors.last_name = "Last name is required (min 2 chars)"
  }
  const phone = String(phone_number || "").trim()
  if (!phone || phone.length < 7 || phone.length > 20) {
    errors.phone_number = "Phone number must be 7-20 chars"
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateAddress(payload) {
  const errors = {}
  if (!payload || typeof payload !== "object") {
    return { valid: false, errors: { _root: "Invalid payload" } }
  }
  const { address_details, city, state, pin_code } = payload

  if (!address_details || String(address_details).trim().length < 5) {
    errors.address_details = "Address details required (min 5 chars)"
  }
  if (!city || String(city).trim().length < 2) {
    errors.city = "City is required"
  }
  if (!state || String(state).trim().length < 2) {
    errors.state = "State is required"
  }
  const pin = String(pin_code || "").trim()
  if (!pin || pin.length < 3 || pin.length > 12) {
    errors.pin_code = "PIN code must be 3-12 chars"
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
