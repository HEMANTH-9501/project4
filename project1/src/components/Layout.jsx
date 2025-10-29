import { Outlet, useLocation } from "react-router-dom"
import "./Layout.css"

export default function Layout({ addToast }) {
  const location = useLocation()

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true
    if (path !== "/" && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-content">
          <div className="brand-section">
            <h1 className="brand-title">TALENTFLOW</h1>
            <span className="brand-subtitle">A MINI HIRING PLATFORM</span>
          </div>
          
          <nav className="layout-nav">
            <a 
              href="/" 
              className={`nav-link ${isActive("/") ? "active" : ""}`}
            >
              Jobs
            </a>
            <a 
              href="/candidates" 
              className={`nav-link ${isActive("/candidates") ? "active" : ""}`}
            >
              Candidates
            </a>
            <a 
              href="/assessments" 
              className={`nav-link ${isActive("/assessments") ? "active" : ""}`}
            >
              Assessments
            </a>
          </nav>

          <div className="header-actions">
            <span className="user-name">Admin</span>
          </div>
        </div>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}
