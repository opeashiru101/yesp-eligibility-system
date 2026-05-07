import { useState, useEffect } from "react"
import axios from "axios"

const bandColors = {
  "Highly Eligible": { color: "#1D9E75", bg: "#E1F5EE" },
  "Likely Eligible": { color: "#3b82f6", bg: "#eff6ff" },
  "Partially Eligible": { color: "#f59e0b", bg: "#fffbeb" },
  "Not Currently Eligible": { color: "#ef4444", bg: "#fef2f2" }
}

export default function History({ onBack }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    axios.get("http://localhost:8000/applications")
      .then(res => {
        setApplications(res.data)
        setLoading(false)
      })
      .catch(() => {
        setError("Could not load submissions. Make sure the backend is running.")
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#f0f4f8", minHeight: "100vh", width: "100%", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#1D9E75", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1D9E75", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              BOI YES-P Eligibility Check
            </span>
          </div>
          <button
            onClick={onBack}
            style={{ padding: "8px 16px", background: "transparent", border: "1.5px solid #1D9E75", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#1D9E75", cursor: "pointer" }}
          >
            ← Back to Form
          </button>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
          Submission History
        </h1>
        <p style={{ fontSize: 15, color: "#64748b", marginBottom: "2rem" }}>
          All eligibility assessments submitted through the system.
        </p>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "3rem", color: "#64748b", fontSize: 15 }}>
            Loading submissions...
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "1rem", color: "#dc2626", fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && applications.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: "#64748b", fontSize: 15 }}>
            No submissions yet. Submit an application to see it here.
          </div>
        )}

        {/* Summary stats */}
        {applications.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
            {[
              { label: "Total Submissions", value: applications.length, color: "#1D9E75" },
              { label: "Highly Eligible", value: applications.filter(a => a.eligibility_band === "Highly Eligible").length, color: "#1D9E75" },
              { label: "Likely Eligible", value: applications.filter(a => a.eligibility_band === "Likely Eligible").length, color: "#3b82f6" },
              { label: "Not Eligible", value: applications.filter(a => a.eligibility_band === "Not Currently Eligible").length, color: "#ef4444" }
            ].map(stat => (
              <div key={stat.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "1rem", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {applications.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa", borderBottom: "1px solid #e2e8f0" }}>
                    {["#", "Name", "Age", "Business", "Sector", "Score", "Band", "Submitted"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, index) => {
                    const band = bandColors[app.eligibility_band] || bandColors["Partially Eligible"]
                    const date = new Date(app.submitted_at).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "short", year: "numeric"
                    })
                    return (
                      <tr key={app.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8" }}>{index + 1}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap" }}>{app.full_name}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569" }}>{app.age}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569", maxWidth: 200 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {app.business_name}
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>{app.business_sector}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: band.color }}>{app.overall_score}/100</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ padding: "4px 10px", borderRadius: 20, background: band.bg, color: band.color, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                            {app.eligibility_band}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>{date}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}