import { useState } from "react"
import axios from "axios"

const sectors = [
  "Agro-Processing & Food Production",
  "Manufacturing & Fabrication",
  "Health & Personal Care",
  "Creative & Digital Industries",
  "Construction & Technical Services",
  "Agriculture & Allied Services",
  "Education, Services & Environment"
]

const qualifications = [
  "Below OND",
  "OND (Ordinary National Diploma)",
  "HND (Higher National Diploma)",
  "University Degree (B.Sc. / B.A. / B.Eng.)",
  "Postgraduate (M.Sc. / MBA / Ph.D.)"
]

const stages = [
  "Just an idea (not started yet)",
  "Early-stage (started but pre-revenue)",
  "Already operating"
]

const labelStyle = {
  display: "block", fontSize: 13, fontWeight: 500,
  color: "#475569", marginBottom: 6
}

const inputStyle = {
  width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
  borderRadius: 8, fontSize: 14, background: "#f8fafc",
  color: "#1e293b", fontFamily: "inherit", outline: "none"
}

export default function ApplicationForm({ onResults, onViewHistory }) {
  const [form, setForm] = useState({
    full_name: "",
    age: "",
    nationality: "Nigerian",
    education: "",
    training_completed: "Yes",
    business_name: "",
    business_description: "",
    business_sector: "",
    business_stage: ""
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }


  const handleTraining = (value) => {
    setForm({ ...form, training_completed: value })
  }

  const submit = async () => {
    setError("")
    if (!form.full_name || !form.age || !form.education || !form.business_name || !form.business_description || !form.business_sector || !form.business_stage) {
      setError("Please fill in all fields before checking your eligibility.")
      return
    }
    setLoading(true)
    try {
      const response = await axios.post("http://localhost:8000/assess", {
        ...form,
        age: parseInt(form.age)
      })
      onResults(response.data, form.full_name)
    } catch (err) {
      setError("Something went wrong. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      fontFamily: "'Segoe UI', sans-serif",
      background: "#f0f4f8",
      minHeight: "100vh",
      width: "100%",
      padding: "2rem 1rem"
    }}>
      <div style={{ maxWidth: 680, margin: "0 auto", width: "100%" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.75rem" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: "#1D9E75", display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span style={{
              fontSize: 12, fontWeight: 600, color: "#1D9E75",
              letterSpacing: "0.08em", textTransform: "uppercase"
            }}>
              BOI YES-P Eligibility Check
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem", lineHeight: 1.2 }}>
            Check your eligibility
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.6 }}>
            Answer a few questions about yourself and your business. We'll tell you if you qualify for BOI Youth Entrepreneurship funding — and exactly what to improve if you don't.
          </p>
        </div>

        {/* Section 1 — About You */}
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 14, overflow: "hidden", marginBottom: "1.25rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{
            padding: "1rem 1.25rem", borderBottom: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", gap: 10, background: "#fafafa"
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%", background: "#E1F5EE",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#0F6E56"
            }}>1</div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>About you</span>
          </div>

          <div style={{ padding: "1.25rem" }}>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Full name</label>
              <input name="full_name" value={form.full_name} onChange={handle}
                placeholder="e.g. Amaka Okonkwo" style={inputStyle} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={labelStyle}>Age</label>
                <input name="age" type="number" value={form.age} onChange={handle}
                  placeholder="e.g. 26" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Nationality</label>
                <select name="nationality" value={form.nationality} onChange={handle} style={inputStyle}>
                  <option>Nigerian</option>
                  <option>Non-Nigerian</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Highest qualification</label>
              <select name="education" value={form.education} onChange={handle} style={inputStyle}>
                <option value="">Select your qualification</option>
                {qualifications.map(q => <option key={q}>{q}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Have you completed the YES-P capacity building training?</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Yes", "No", "In Progress"].map(opt => (
                  <div
                    key={opt}
                    onClick={() => handleTraining(opt)}
                    style={{
                      flex: "1 1 auto",
                      minWidth: 100,
                      padding: "10px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      border: form.training_completed === opt ? "1.5px solid #1D9E75" : "1.5px solid #e2e8f0",
                      background: form.training_completed === opt ? "#E1F5EE" : "#f8fafc",
                      fontSize: 13,
                      fontWeight: form.training_completed === opt ? 600 : 400,
                      color: form.training_completed === opt ? "#0F6E56" : "#1e293b",
                      textAlign: "center",
                      transition: "all 0.15s"
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Section 2 — About Your Business */}
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 14, overflow: "hidden", marginBottom: "1.25rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{
            padding: "1rem 1.25rem", borderBottom: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", gap: 10, background: "#fafafa"
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%", background: "#E1F5EE",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#0F6E56"
            }}>2</div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>About your business</span>
          </div>

          <div style={{ padding: "1.25rem" }}>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Business name</label>
              <input name="business_name" value={form.business_name} onChange={handle}
                placeholder="e.g. FreshPack Foods" style={inputStyle} />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>What does your business do?</label>
              <textarea
                name="business_description"
                value={form.business_description}
                onChange={handle}
                rows={3}
                placeholder="Describe what you make, sell, or provide. For example: I process locally grown tomatoes into packaged tomato paste and supply to supermarkets and restaurants."
                style={{ ...inputStyle, resize: "vertical", minHeight: 90 }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Business sector</label>
                <select name="business_sector" value={form.business_sector} onChange={handle} style={inputStyle}>
                  <option value="">Select your sector</option>
                  {sectors.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Business stage</label>
                <select name="business_stage" value={form.business_stage} onChange={handle} style={inputStyle}>
                  <option value="">Select your stage</option>
                  {stages.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 8, padding: "0.75rem 1rem",
            marginBottom: "1rem", fontSize: 14, color: "#dc2626"
          }}>
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={submit}
          disabled={loading}
          style={{
            width: "100%", padding: 15,
            background: loading ? "#9ecfbf" : "#1D9E75",
            border: "none", borderRadius: 10,
            fontSize: 15, fontWeight: 600,
            color: "white", cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "0.75rem", letterSpacing: "0.01em"
          }}
        >
          {loading ? "Checking your eligibility..." : "Check my eligibility →"}
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
          Your information is used only for this assessment and is not shared with any third party.
        </p>
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
  <button
    onClick={onViewHistory}
    style={{ background: "transparent", border: "none", fontSize: 13, color: "#94a3b8", cursor: "pointer", textDecoration: "underline" }}
  >
    View submission history
  </button>
</div>

      </div>
    </div>
  )
}