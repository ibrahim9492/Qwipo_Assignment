"use client"

export default function AddressList({ rows, onEdit, onDelete }) {
  if (!rows?.length) {
    return <div className="card">No addresses yet.</div>
  }

  return (
    <div className="grid">
      {rows.map((a) => (
        <div className="card" key={a.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
            <div>
              <div className="badge" style={{ marginBottom: 8 }}>
                #{a.id}
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{a.address_details}</div>
              <div className="helper" style={{ marginTop: 6 }}>
                {a.city}, {a.state} {a.pin_code}
              </div>
            </div>
            <div>
              <button className="btn secondary" onClick={() => onEdit(a)}>
                Edit
              </button>
              <button className="btn danger" style={{ marginLeft: 6 }} onClick={() => onDelete(a)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
