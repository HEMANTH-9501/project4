import { useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "react-query"
import "./JobDetailPage.css"

export default function JobDetailPage() {
  const { jobId } = useParams()

  const queryClient = useQueryClient()
  const {
    data: job,
    isLoading,
    error,
  } = useQuery(["job", jobId], async () => {
    const response = await fetch(`/api/jobs/${jobId}`)
    if (!response.ok) throw new Error("Failed to fetch job")
    return response.json()
  })

  const mutation = useMutation(
    async (newStatus) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update job status")
      }
      return response.json()
    },
    {
      onSuccess: (data) => {
        if (!data || !data.id) {
          // If the job is missing after update, show error
          window.alert("Job not found after update. Please refresh the page.")
        }
        queryClient.invalidateQueries(["job", jobId])
        queryClient.invalidateQueries("jobs")
      },
      onError: (error) => {
        window.alert(error.message || "Failed to update job status")
      }
    }
  )

  if (isLoading) return <div className="loading">Loading job...</div>
  if (error) return <div className="error">Error loading job</div>
  if (!job) return <div className="error">Job not found or may have been removed. Please refresh the page.</div>

  // Defensive: log job object and check for object fields
  console.log("Job object:", job)
  const isObject = (val) => val && typeof val === "object" && !Array.isArray(val)
  if (isObject(job.title) || isObject(job.slug) || isObject(job.status) || isObject(job.description)) {
    return (
      <div className="error">
        Job data is corrupted. One of the fields is an object.<br />
        <pre>{JSON.stringify(job, null, 2)}</pre>
        Please check the backend response and PATCH handler.
      </div>
    )
  }

  return (
    <div className="job-detail">
      <h2>{String(job.title)}</h2>
      <div className="job-info">
        <p>
          <strong>Slug:</strong> {String(job.slug)}
        </p>
        <p>
          <strong>Status:</strong> {String(job.status)}
        </p>
        <p>
          <strong>Tags:</strong> {Array.isArray(job.tags) ? job.tags.join(", ") : String(job.tags)}
        </p>
        <p>
          <strong>Description:</strong> {String(job.description)}
        </p>
        <button
          className="btn btn-secondary"
          disabled={mutation.isLoading}
          onClick={() => mutation.mutate(job.status === "active" ? "archived" : "active")}
        >
          {mutation.isLoading
            ? "Updating..."
            : job.status === "active"
            ? "Archive"
            : "Activate"}
        </button>
        {mutation.isError && (
          <div className="error">Failed to update status</div>
        )}
      </div>
    </div>
  )
}
