import { useState } from "react"
import { useQuery } from "react-query"
import { useToast } from "../contexts/ToastContext"
import JobsList from "../components/jobs/JobsList"
import JobModal from "../components/jobs/JobModal"
import "./JobsPage.css"

export default function JobsPage() {
  const { addToast } = useToast()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [selectedTags, setSelectedTags] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [isReordering, setIsReordering] = useState(false)

  const { data, isLoading, error, refetch } = useQuery(
    ["jobs", page, search, status, selectedTags.join(",")],
    async () => {
      const params = new URLSearchParams({
        page,
        pageSize: 10, // Perfect for 2x5 grid
        search,
        status: status === "all" ? "" : status,
        tags: selectedTags.join(","),
      })
      const response = await fetch(`/api/jobs?${params}`)
      if (!response.ok) throw new Error("Failed to fetch jobs")
      return response.json()
    }
  )

  const handleReorderJob = async (jobId, fromOrder, toOrder) => {
    setIsReordering(true)
    try {
      const response = await fetch(`/api/jobs/${jobId}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromOrder, toOrder }),
      })

      if (!response.ok) {
        throw new Error("Failed to reorder job")
      }

      refetch()
      addToast({
        type: "success",
        message: "Job reordered successfully",
      })
    } catch (error) {
      addToast({
        type: "error",
        message: "Failed to reorder job. Please try again.",
      })
    } finally {
      setIsReordering(false)
    }
  }

  const handleArchiveJob = async (jobId, currentStatus) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: currentStatus === "active" ? "archived" : "active",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update job status")
      }

      refetch()
      addToast({
        type: "success",
        message: `Job ${currentStatus === "active" ? "archived" : "activated"} successfully`,
      })
    } catch (error) {
      addToast({
        type: "error",
        message: "Failed to update job status. Please try again.",
      })
    }
  }

  const handleCreateJob = () => {
    setEditingJob(null)
    setShowModal(true)
  }

  const handleEditJob = (job) => {
    setEditingJob(job)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingJob(null)
  }

  // Available tags from constant
  const availableTags = ["remote", "full-time", "contract", "startup", "enterprise", "fast-growing"]

  const handleTagChange = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    )
  }

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <div className="header-left">
          <h1>Jobs Management</h1>
          <p className="header-subtitle">Manage job postings, track applications, and organize your hiring pipeline</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary btn-create" onClick={handleCreateJob}>
            <span className="btn-icon">+</span>
            Create New Job
          </button>
        </div>
      </div>

      <div className="jobs-stats">
        <div className="stat-card">
          <div className="stat-number">{data?.total || 0}</div>
          <div className="stat-label">Total Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{data?.jobs?.filter(j => j?.status === 'active').length || 0}</div>
          <div className="stat-label">Active Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{data?.jobs?.filter(j => j?.status === 'archived').length || 0}</div>
          <div className="stat-label">Archived Jobs</div>
        </div>
      </div>

      <div className="jobs-filters">
        <div className="filters-left">
          <div className="search-group">
            <input
              type="search"
              placeholder="Search jobs by title or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="status-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="archived">Archived Only</option>
          </select>
        </div>
        <div className="filters-right">
          <span className="results-count">
            {data?.total || 0} jobs found
          </span>
        </div>
      </div>

      <div className="tags-filter">
        <span className="tags-label">Filter by tags:</span>
        <div className="tags-container">
          {availableTags.map(tag => (
            <label key={tag} className={`tag-checkbox ${selectedTags.includes(tag) ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={() => handleTagChange(tag)}
              />
              <span className="tag-text">{tag}</span>
            </label>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading jobs...</p>
        </div>
      )}
      
      {error && (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error loading jobs</h3>
          <p>There was a problem loading the jobs. Please try again.</p>
          <button className="btn btn-primary" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {data && (
        <>
          <JobsList 
            jobs={data.jobs} 
            onEdit={handleEditJob} 
            onArchive={handleArchiveJob}
            onReorder={handleReorderJob}
            isReordering={isReordering}
            addToast={addToast} 
          />
          
          {data.jobs.length > 0 && (
            <div className="pagination">
            <div className="pagination-info">
              Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.total)} of {data.total} jobs (2×5 grid view)
            </div>
              <div className="pagination-controls">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage((p) => p - 1)} 
                  className="btn btn-pagination"
                >
                  ← Previous
                </button>
                <span className="page-number">Page {page}</span>
                <button 
                  disabled={!data.hasMore} 
                  onClick={() => setPage((p) => p + 1)} 
                  className="btn btn-pagination"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <JobModal
          job={editingJob}
          onClose={handleCloseModal}
          onSave={() => {
            handleCloseModal()
            refetch()
            addToast(editingJob ? "Job updated successfully" : "Job created successfully", "success")
          }}
          addToast={addToast}
        />
      )}
    </div>
  )
}
