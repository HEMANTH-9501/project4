import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "react-query"
import { useToast } from "../contexts/ToastContext"
import AssessmentBuilder from "../components/assessments/AssessmentBuilder"
import FormRuntime from "../components/assessments/FormRuntime"
import "./AssessmentsPage.css"

export default function AssessmentsPage() {
  console.log('AssessmentsPage rendering...')
  
  try {
    const { addToast } = useToast()
    const { jobId } = useParams()
    const navigate = useNavigate()
    const [mode, setMode] = useState("builder") // "builder" or "runtime"
    const [candidateId] = useState(1) // In a real app, this would come from auth/context
    
    console.log('AssessmentsPage - jobId:', jobId)
    console.log('AssessmentsPage - addToast:', addToast)

    // Always declare hooks first
    const jobsQuery = useQuery(["jobs", 1, "", "all", ""], async () => {
      const params = new URLSearchParams({ page: 1, pageSize: 100 })
      const response = await fetch(`/api/jobs?${params}`)
      if (!response.ok) throw new Error("Failed to fetch jobs")
      return response.json()
    }, { enabled: !jobId })

    const assessmentQuery = useQuery(["assessment", jobId], async () => {
      const response = await fetch(`/api/assessments/${jobId}`)
      if (!response.ok) throw new Error("Failed to fetch assessment")
      return response.json()
    }, { enabled: !!jobId })

    const handleAssessmentSubmit = () => {
      addToast("Assessment submitted successfully!", "success")
      setMode("builder")
    }

    const handleDraftSave = () => {
      addToast("Draft saved", "success")
    }

    if (!jobId && jobsQuery.isLoading) return <div className="loading">Loading jobs...</div>
    if (!jobId && jobsQuery.error) return <div className="error">Error loading jobs</div>
    if (!jobId) {
      return (
        <div className="assessments-page">
          <h2>Select a Job to Build Assessment</h2>
          <ul className="job-list">
            {jobsQuery.data?.jobs?.map(job => (
              <li key={job.id}>
                <button className="job-link" onClick={() => navigate(`/assessments/${job.id}`)}>
                  {job.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )
    }

    if (assessmentQuery.isLoading) return <div className="loading">Loading assessment...</div>
    if (assessmentQuery.error) return <div className="error">Error loading assessment</div>

    return (
      <div className="assessments-page">
        <div className="assessments-header">
          <h2>Assessment Builder</h2>
          <div className="mode-toggle">
            <button 
              className={`mode-btn ${mode === "builder" ? "active" : ""}`}
              onClick={() => setMode("builder")}
            >
              Builder
            </button>
            <button 
              className={`mode-btn ${mode === "runtime" ? "active" : ""}`}
              onClick={() => setMode("runtime")}
              disabled={!assessmentQuery.data?.sections?.length}
            >
              Preview
            </button>
          </div>
        </div>

        {mode === "builder" ? (
          <AssessmentBuilder 
            jobId={jobId} 
            assessment={assessmentQuery.data} 
            addToast={addToast} 
          />
        ) : (
          <FormRuntime 
            assessment={assessmentQuery.data}
            candidateId={candidateId}
            onSubmit={handleAssessmentSubmit}
            onSaveDraft={handleDraftSave}
          />
        )}
      </div>
    )
  } catch (error) {
    console.error('Error in AssessmentsPage:', error)
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Assessment Page Error</h2>
        <p><strong>Error:</strong> {error.message}</p>
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>{error.stack}</pre>
      </div>
    )
  }
}
