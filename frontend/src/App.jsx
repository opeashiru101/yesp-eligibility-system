import { useState } from "react"
import ApplicationForm from "./pages/ApplicationForm"
import Results from "./pages/Results"
import History from "./pages/History"

function App() {
  const [results, setResults] = useState(null)
  const [applicantName, setApplicantName] = useState("")
  const [showHistory, setShowHistory] = useState(false)

  if (showHistory) {
    return <History onBack={() => setShowHistory(false)} />
  }

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "#f0f4f8" }}>
      {!results ? (
        <ApplicationForm
          onResults={(data, name) => {
            setResults(data)
            setApplicantName(name)
          }}
          onViewHistory={() => setShowHistory(true)}
        />
      ) : (
        <Results
          data={results}
          applicantName={applicantName}
          onBack={() => setResults(null)}
        />
      )}
    </div>
  )
}

export default App