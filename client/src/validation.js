export function validateCustomer(values) {
  const errors = {}
  const { first_name, last_name, phone_number } = values

  if (!first_name || first_name.trim().length < 2) errors.first_name = "First name (min 2 chars)"
  if (!last_name || last_name.trim().length < 2) errors.last_name = "Last name (min 2 chars)"

  const phone = String(phone_number || "").trim()
  if (!phone || phone.length < 7 || phone.length > 20) errors.phone_number = "Phone 7-20 chars"

  return errors
}

export function validateAddress(values) {
  const errors = {}
  const { address_details, city, state, pin_code } = values

  if (!address_details || address_details.trim().length < 5) errors.address_details = "Address details (min 5 chars)"
  if (!city || city.trim().length < 2) errors.city = "City required"
  if (!state || state.trim().length < 2) errors.state = "State required"
  const pin = String(pin_code || "").trim()
  if (!pin || pin.length < 3 || pin.length > 12) errors.pin_code = "PIN 3-12 chars"

  return errors
}
