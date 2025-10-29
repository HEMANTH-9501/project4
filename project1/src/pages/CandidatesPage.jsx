import { useState, useRef } from "react"
import { useQuery } from "react-query"
import CandidatesList from "../components/candidates/CandidatesList"
import KanbanBoard from "../components/candidates/KanbanBoard"
import "./CandidatesPage.css"

const STAGES = {
  applied: { label: "Applied", color: "#64748b" },
  screen: { label: "Screen", color: "#0ea5e9" },
  tech: { label: "Technical", color: "#8b5cf6" },
  offer: { label: "Offer", color: "#22c55e" },
  hired: { label: "Hired", color: "#16a34a" },
  rejected: { label: "Rejected", color: "#ef4444" }
}

export default function CandidatesPage({ addToast }) {
  const [view, setView] = useState("table")
  const [search, setSearch] = useState("")
  const [stage, setStage] = useState("all")
  const [page, setPage] = useState(1)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showTimeline, setShowTimeline] = useState(false)
  const [showAssessments, setShowAssessments] = useState(false)
  const pageSize = 50
  const [virtualListRef, setVirtualListRef] = useState(null)

  const { data: assessmentData, isLoading: isAssessmentLoading } = useQuery(
    ["candidateAssessment", selectedCandidate?.id],
    async () => {
      if (!selectedCandidate) return null
      const response = await fetch(`/api/candidates/${selectedCandidate.id}/assessment`)
      if (!response.ok) throw new Error("Failed to fetch assessment")
      return response.json()
    },
    { enabled: !!selectedCandidate }
  )

  const { data: candidatesData, isLoading, error } = useQuery(
    ["candidates", page, search, stage],
    async () => {
      console.log("Fetching candidates with params:", { page, search, stage, pageSize })
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
        stage: stage === "all" ? "" : stage,
      })
      const response = await fetch(`/api/candidates?${params}`)
      console.log("Candidates API response status:", response.status)
      if (!response.ok) throw new Error("Failed to fetch candidates")
      const data = await response.json()
      console.log("Received candidates data:", data)
      return data
    },
    {
      onError: (error) => {
        console.error("Error fetching candidates:", error)
        addToast("Failed to load candidates", "error")
      }
    }
  )

  const { data: timelineData, isLoading: isTimelineLoading } = useQuery(
    ["candidateTimeline", selectedCandidate?.id],
    async () => {
      if (!selectedCandidate) return null
      const response = await fetch(`/api/candidates/${selectedCandidate.id}/timeline`)
      if (!response.ok) throw new Error("Failed to fetch timeline")
      return response.json()
    },
    { enabled: !!selectedCandidate }
  )

  const handleStageChange = async (candidateId, newStage) => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      })

      if (!response.ok) throw new Error("Failed to update candidate stage")

      addToast("Candidate stage updated successfully", "success")
    } catch (error) {
      console.error('Failed to update stage:', error)
      addToast("Failed to update candidate stage", "error")
    }
  }

  return (
    <div className="candidates-page">
      <div className="page-header">
        <h1 className="page-title">Candidates</h1>
        <div className="filters-toolbar">
          <div className="search-box">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search candidates..."
            />
          </div>
          
          <div className="stage-filter">
            <select
              value={stage}
              onChange={(e) => {
                setStage(e.target.value)
                setPage(1)
              }}
            >
              <option value="all">All Stages</option>
              {Object.entries(STAGES).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="view-toggle">
            <button
              className={view === "table" ? "active" : ""}
              onClick={() => {
                setView("table")
                setShowTimeline(false)
              }}
            >
              Table View
            </button>
            <button
              className={view === "kanban" ? "active" : ""}
              onClick={() => {
                setView("kanban")
                setShowTimeline(false)
              }}
            >
              Kanban Board
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        {isLoading && <div className="loading">Loading candidates...</div>}
        {error && <div className="error">Error loading candidates</div>}
        {candidatesData && (
          <div className="content-layout">
            <div className="content-main">
              {view === "table" ? (
                <>
                  <CandidatesList 
                    candidates={Array.isArray(candidatesData.candidates) ? candidatesData.candidates : []} 
                    isLoading={isLoading}
                    onSelect={setSelectedCandidate}
                    onStageChange={handleStageChange}
                    virtualListRef={virtualListRef}
                    setVirtualListRef={setVirtualListRef}
                  />
                  <div className="pagination">
                    <button 
                      className="btn btn-secondary" 
                      disabled={page === 1} 
                      onClick={() => setPage(p => p - 1)}
                    >
                      Previous
                    </button>
                    <span className="page-info">Page {page}</span>
                    <button
                      className="btn btn-secondary"
                      disabled={!candidatesData.hasMore}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <KanbanBoard
                  candidates={Array.isArray(candidatesData.candidates) ? candidatesData.candidates : []}
                  onStageChange={handleStageChange}
                  onSelect={setSelectedCandidate}
                />
              )}
            </div>

            {selectedCandidate && (
              <div className="sidebar">
                <div className="candidate-details">
                  <h2>{selectedCandidate.name}</h2>
                  <p className="candidate-email">{selectedCandidate.email}</p>
                  <p className="candidate-stage">
                    Current Stage: {STAGES[selectedCandidate.stage]?.label || selectedCandidate.stage}
                  </p>
                  
                  <div className="action-buttons">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setShowTimeline(!showTimeline)}
                    >
                      {showTimeline ? 'Hide Timeline' : 'Show Timeline'}
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setShowAssessments(!showAssessments)}
                    >
                      {showAssessments ? 'Hide Assessments' : 'Show Assessments'}
                    </button>
                  </div>

                  {showTimeline && (
                    <div className="timeline-panel">
                      <h3>Timeline</h3>
                      {isTimelineLoading ? (
                        <div className="loading">Loading timeline...</div>
                      ) : timelineData ? (
                        <div className="timeline">
                          {timelineData.events.map(event => (
                            <div key={event.id} className="timeline-event">
                              <div className="event-time">
                                {new Date(event.timestamp).toLocaleString()}
                              </div>
                              <div className="event-content">
                                {event.type === 'STAGE_CHANGE' ? (
                                  `Stage changed from ${event.data.from || 'none'} to ${event.data.to}`
                                ) : (
                                  event.content
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}

                  {showAssessments && (
                    <div className="assessment-panel">
                      <h3>Assessments</h3>
                      {isAssessmentLoading ? (
                        <div className="loading">Loading assessments...</div>
                      ) : assessmentData ? (
                        <>
                          <div className="assessment-status">
                            <div className="status-label">Progress</div>
                            <div className="status-value">
                              {assessmentData.completedCount} of {assessmentData.totalCount} completed
                            </div>
                          </div>
                          <div className="assessment-actions">
                            <button className="btn btn-primary">
                              {assessmentData.completedCount === 0 ? 'Start Assessment' : 'Continue Assessment'}
                            </button>
                            {assessmentData.completedCount > 0 && (
                              <button className="btn btn-secondary">View Results</button>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="no-assessment">
                          No assessments available for this position
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}