import { useParams } from "react-router-dom"
import { useQuery } from "react-query"
import "./CandidateDetailPage.css"

export default function CandidateDetailPage({ addToast }) {
  const { id } = useParams()
  const {
    data: candidate,
    isLoading,
    error,
  } = useQuery(["candidate", id], async () => {
    const response = await fetch(`/api/candidates/${id}`)
    if (!response.ok) throw new Error("Failed to fetch candidate")
    return response.json()
  })

  const { data: timeline } = useQuery(["candidateTimeline", id], async () => {
    const response = await fetch(`/api/candidates/${id}/timeline`)
    if (!response.ok) throw new Error("Failed to fetch timeline")
    return response.json()
  })

  if (isLoading) return <div className="loading">Loading candidate...</div>
  if (error) return <div className="error">Error loading candidate</div>
  if (!candidate) return <div className="error">Candidate not found</div>

  return (
    <div className="candidate-detail">
      <h2>{candidate.name}</h2>
      <div className="candidate-info">
        <p>
          <strong>Email:</strong> {candidate.email}
        </p>
        <p>
          <strong>Stage:</strong> {candidate.stage}
        </p>
        <p>
          <strong>Applied Date:</strong> {new Date(candidate.createdAt).toLocaleDateString()}
        </p>
      </div>

      {timeline && (
        <div className="timeline">
          <h3>Status Timeline</h3>
          {timeline.map((event, idx) => (
            <div key={idx} className="timeline-event">
              <span className="timeline-date">{new Date(event.timestamp).toLocaleDateString()}</span>
              <span className="timeline-stage">{event.stage}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
