import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts"

const bandConfig = {
  "Highly Eligible": { color: "#1D9E75", bg: "#E1F5EE", message: "Great news! You meet the key requirements for YES-P funding." },
  "Likely Eligible": { color: "#3b82f6", bg: "#eff6ff", message: "You're close! A few areas to strengthen before applying." },
  "Partially Eligible": { color: "#f59e0b", bg: "#fffbeb", message: "You have some gaps to address before you can apply." },
  "Not Currently Eligible": { color: "#ef4444", bg: "#fef2f2", message: "You don't meet some key requirements yet — but here's what to work on." }
}

const dimensionLabels = {
  citizenship: "Citizenship",
  age_eligibility: "Age",
  education: "Education",
  training_completion: "Training",
  sme_cluster_alignment: "Sector Fit",
  value_addition_innovation: "Strength"
}

const dimensionFullLabels = {
  citizenship: "Citizenship",
  age_eligibility: "Age Requirement",
  education: "Educational Qualification",
  training_completion: "YES-P Training",
  sme_cluster_alignment: "Business Sector Fit",
  value_addition_innovation: "Business Strength"
}

const dimensionMax = {
  citizenship: 10,
  age_eligibility: 10,
  education: 15,
  training_completion: 25,
  sme_cluster_alignment: 20,
  value_addition_innovation: 20
}

const CustomTick = ({ x, y, payload, textAnchor }) => {
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill="#64748b"
      fontSize={10}
      dy={4}
    >
      {payload.value}
    </text>
  )
}

export default function Results({ data, applicantName, onBack }) {
  const band = bandConfig[data.eligibility_band] || bandConfig["Partially Eligible"]

  const radarData = Object.entries(data.dimension_scores).map(([key, value]) => ({
    dimension: dimensionLabels[key],
    score: Math.round((value / dimensionMax[key]) * 100),
    fullMark: 100
  }))

  const weakDimensions = Object.entries(data.dimension_scores).filter(
    ([key, value]) => value < dimensionMax[key]
  )

  const strongDimensions = Object.entries(data.dimension_scores).filter(
    ([key, value]) => value === dimensionMax[key]
  )

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#f0f4f8", minHeight: "100vh", width: "100%", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#1D9E75", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#1D9E75", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            BOI YES-P Eligibility Check
          </span>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
          Hi {applicantName.split(" ")[0]}, here is your result
        </h1>
        <p style={{ fontSize: 15, color: "#64748b", marginBottom: "2rem" }}>
          Here's how your application stacks up against the YES-P eligibility criteria.
        </p>

        {/* Score Card */}
        <div style={{
          background: band.bg, border: `1.5px solid ${band.color}`,
          borderRadius: 14, padding: "1.5rem", marginBottom: "1.25rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "1rem"
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: band.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              Overall Score
            </div>
            <div style={{ fontSize: 52, fontWeight: 800, color: band.color, lineHeight: 1 }}>
              {data.overall_score}<span style={{ fontSize: 22, fontWeight: 500 }}>/100</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              display: "inline-block", padding: "6px 16px", borderRadius: 20,
              background: band.color, color: "white", fontSize: 14,
              fontWeight: 600, marginBottom: 8
            }}>
              {data.eligibility_band}
            </div>
            <p style={{ fontSize: 14, color: "#475569", maxWidth: 260, lineHeight: 1.5 }}>
              {band.message}
            </p>
          </div>
        </div>

        {/* Radar Chart + Dimension Scores */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "1.25rem", marginBottom: "1.25rem"
        }}>

          {/* Radar Chart */}
          <div style={{
            background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 14, padding: "1.25rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: "1rem" }}>
              Your eligibility profile
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={<CustomTick />}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#1D9E75"
                  fill="#1D9E75"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Dimension Scores */}
          <div style={{
            background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 14, padding: "1.25rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: "1rem" }}>
              Score breakdown
            </div>
            {Object.entries(data.dimension_scores).map(([key, value]) => {
              const max = dimensionMax[key]
              const pct = Math.round((value / max) * 100)
              const isWeak = value < max
              return (
                <div key={key} style={{ marginBottom: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: "#475569" }}>{dimensionFullLabels[key]}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: isWeak ? "#f59e0b" : "#1D9E75" }}>
                      {value}/{max}
                    </span>
                  </div>
                  <div style={{ background: "#f1f5f9", borderRadius: 4, height: 6, overflow: "hidden" }}>
                    <div style={{
                      width: `${pct}%`, height: "100%", borderRadius: 4,
                      background: isWeak ? "#f59e0b" : "#1D9E75",
                      transition: "width 0.6s ease"
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Feedback */}
        {weakDimensions.length > 0 && (
          <div style={{
            background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 14, padding: "1.25rem", marginBottom: "1.25rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: "1rem" }}>
              What to work on
            </div>
            {data.feedback && (
              <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.8, padding: "1rem", background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a" }}>
                {data.feedback}
              </div>
            )}
          </div>
        )}

        {/* Strong areas */}
        {strongDimensions.length > 0 && (
          <div style={{
            background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 14, padding: "1.25rem", marginBottom: "1.25rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: "1rem" }}>
              Where you're strong
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {strongDimensions.map(([key]) => (
                <div key={key} style={{
                  padding: "6px 14px", borderRadius: 20,
                  background: "#E1F5EE", color: "#0F6E56",
                  fontSize: 13, fontWeight: 500,
                  display: "flex", alignItems: "center", gap: 6
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {dimensionFullLabels[key]}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disqualifiers */}
        {data.disqualifiers && data.disqualifiers !== "NONE" && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 14, padding: "1.25rem", marginBottom: "1.25rem"
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#dc2626", marginBottom: "0.5rem" }}>
              Important — criteria not met
            </div>
            <p style={{ fontSize: 14, color: "#7f1d1d", lineHeight: 1.7 }}>
              {data.disqualifiers}
            </p>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            width: "100%", padding: 15, background: "transparent",
            border: "1.5px solid #1D9E75", borderRadius: 10,
            fontSize: 15, fontWeight: 600, color: "#1D9E75",
            cursor: "pointer", marginBottom: "0.75rem"
          }}
        >
          ← Check another application
        </button>

      </div>
    </div>
  )
}
