import { Link } from "react-router-dom"

export default function CustomerList({ rows }) {
  if (!rows?.length) {
    return <div className="card">No customers found.</div>
  }
  return (
    <div className="card" style={{ overflowX: "auto" }}>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Addresses</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>
                {c.first_name} {c.last_name}
              </td>
              <td>{c.phone_number}</td>
              <td>
                <span className="badge">{c.address_count}</span>{" "}
                {c.onlyOneAddress && <span className="badge green">Only One Address</span>}
              </td>
              <td style={{ textAlign: "right" }}>
                <Link className="btn secondary" to={`/customers/${c.id}`}>
                  View
                </Link>
                <Link className="btn" to={`/customers/${c.id}/edit`}>
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
