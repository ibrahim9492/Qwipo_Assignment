import { NavLink, Outlet } from "react-router-dom"

export default function App() {
  return (
    <>
      <header className="app-header">
        <div className="inner container">
          <div className="brand">Customer Management App</div>
          <nav className="nav">
            <NavLink to="/" end>
              Customers
            </NavLink>
            <NavLink to="/customers/new">Add Customer</NavLink>
          </nav>
        </div>
      </header>
      <main className="container page">
        <Outlet />
      </main>
    </>
  )
}
