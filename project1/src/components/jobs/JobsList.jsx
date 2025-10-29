import { useState } from "react"
import { useMutation, useQueryClient } from "react-query"
import "./JobsList.css"

export default function JobsList({ jobs = [], onEdit, onArchive, onReorder, isReordering }) {
  const [draggedJob, setDraggedJob] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)

  const handleDragStart = (e, job) => {
    if (isReordering || job.status !== 'active') return
    
    setDraggedJob(job)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", job.id)

    const dragImage = e.target.cloneNode(true)
    dragImage.style.opacity = "0.5"
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, 0, 0)
    setTimeout(() => document.body.removeChild(dragImage), 0)
  }

  const handleDragOver = (e, job) => {
    e.preventDefault()
    if (!draggedJob || draggedJob.id === job.id || job.status !== 'active') return

    setDropTarget(job)
    e.dataTransfer.dropEffect = "move"

    // Calculate drop position
    const rect = e.currentTarget.getBoundingClientRect()
    const midPoint = rect.top + rect.height / 2
    const isBelow = e.clientY > midPoint

    e.currentTarget.classList.remove('drop-above', 'drop-below')
    e.currentTarget.classList.add(isBelow ? 'drop-below' : 'drop-above')
  }

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drop-above', 'drop-below')
  }

  const handleDrop = async (e, targetJob) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drop-above', 'drop-below')
    setDropTarget(null)

    if (!draggedJob || draggedJob.id === targetJob.id || targetJob.status !== 'active') return

    const rect = e.currentTarget.getBoundingClientRect()
    const midPoint = rect.top + rect.height / 2
    const dropAfter = e.clientY > midPoint

    const targetOrder = dropAfter ? targetJob.order + 1 : targetJob.order
    try {
      await onReorder(draggedJob.id, draggedJob.order, targetOrder)
    } catch (error) {
      console.error('Reorder failed:', error)
    }

    setDraggedJob(null)
  }

  const handleDragEnd = (e) => {
    setDraggedJob(null)
    setDropTarget(null)
    // Clean up any remaining drag effects
    document.querySelectorAll('.job-card').forEach(card => {
      card.classList.remove('drop-above', 'drop-below')
    })
  }

  const queryClient = useQueryClient()

  const reorderMutation = useMutation(
    async ({ fromOrder, toOrder }) => {
      const response = await fetch(`/api/jobs/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromOrder, toOrder }),
      })
      if (!response.ok) throw new Error("Failed to reorder jobs")
      return response.json()
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("jobs")
      },
      onError: (error) => {
        console.error('Reorder failed:', error)
      },
    }
  )

  if (!jobs.length) {
    return <div className="jobs-empty">No jobs found</div>
  }

  // Create array with empty slots to fill the 2x5 grid
  const gridJobs = [...jobs]
  const emptySlots = Math.max(0, 10 - jobs.length)
  for (let i = 0; i < emptySlots; i++) {
    gridJobs.push(null)
  }

  return (
    <div className="jobs-list">
      {gridJobs.map((job, index) => 
        job ? (
          <div
            key={job.id}
            className={`job-card ${
              draggedJob?.id === job.id ? 'dragging' :
              dropTarget?.id === job.id ? 'drop-target' :
              ''
            } ${job.status}`}
            draggable={job.status === 'active' && !isReordering}
            onDragStart={(e) => handleDragStart(e, job)}
            onDragOver={(e) => handleDragOver(e, job)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, job)}
            onDragEnd={handleDragEnd}
          >
            <div className="job-card-header">
              <div className="job-title-section">
                <h3 className="job-title">{job.title}</h3>
                <span className={`status-badge ${job.status}`}>
                  {job.status === 'active' ? '🟢 Active' : '🔒 Archived'}
                </span>
              </div>
              <div className="job-order">
                #{job.order + 1}
              </div>
            </div>
            
            <div className="job-details">
              <div className="job-meta">
                <span className="job-slug">/{job.slug}</span>
                <span className="job-created">
                  Created {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
              {job.description && (
                <p className="job-description">{job.description}</p>
              )}
              <div className="job-tags">
                {job.tags?.map((tag) => (
                  <span key={tag} className={`tag tag-${tag}`}>
                    {tag}
                  </span>
                )) || []}
              </div>
            </div>

            <div className="job-actions">
              <button
                className="btn btn-sm btn-edit"
                onClick={() => onEdit(job)}
                disabled={isReordering}
                title="Edit job"
              >
                ✏️ Edit
              </button>
              <button
                className={`btn btn-sm ${job.status === 'active' ? 'btn-archive' : 'btn-activate'}`}
                onClick={() => onArchive(job.id, job.status)}
                disabled={isReordering}
                title={job.status === 'active' ? 'Archive job' : 'Activate job'}
              >
                {job.status === "active" ? "📦 Archive" : "🔄 Activate"}
              </button>
              {job.status === 'active' && (
                <div className="drag-handle" title="Drag to reorder">
                  ⋮⋮
                </div>
              )}
            </div>

            {isReordering && job.status === 'active' && (
              <div className="reorder-overlay">
                <div className="spinner"></div>
                <span>Reordering...</span>
              </div>
            )}
          </div>
        ) : (
          <div key={`empty-${index}`} className="job-card empty-slot">
            <div className="empty-slot-content">
              <div className="empty-slot-icon">📋</div>
              <p>No job here</p>
            </div>
          </div>
        )
      )}
    </div>
  )
}
