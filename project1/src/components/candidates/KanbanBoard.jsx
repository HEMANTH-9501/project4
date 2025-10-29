"use client"

import { useState } from "react"
import "./KanbanBoard.css"

const STAGE_CONFIG = {
  applied: {
    label: "Applied",
    color: "#f59e0b",
    description: "New applications",
  },
  screen: {
    label: "Screening",
    color: "#3b82f6",
    description: "Initial review",
  },
  tech: {
    label: "Technical",
    color: "#10b981",
    description: "Technical assessment",
  },
  offer: {
    label: "Offer",
    color: "#8b5cf6",
    description: "Offer stage",
  },
  hired: {
    label: "Hired",
    color: "#059669",
    description: "Successfully hired",
  },
  rejected: {
    label: "Rejected",
    color: "#ef4444",
    description: "Not moving forward",
  },
}

export default function KanbanBoard({
  candidates = [],
  stages = Object.keys(STAGE_CONFIG),
  onStageChange,
  onCandidateSelect,
}) {
  const [draggedCandidate, setDraggedCandidate] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)
  const [dragOverCandidate, setDragOverCandidate] = useState(null)

  const handleDragStart = (e, candidate) => {
    setDraggedCandidate(candidate)
    e.dataTransfer.effectAllowed = "move"
    e.target.style.opacity = "0.5"

    // Create a drag image
    const dragImage = e.target.cloneNode(true)
    dragImage.style.transform = "translate(-9999px, -9999px)"
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, 0, 0)
    setTimeout(() => document.body.removeChild(dragImage), 0)
  }

  const handleDragOver = (e, stage, candidate = null) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    
    setDragOverColumn(stage)
    setDragOverCandidate(candidate)
    
    // Remove existing drop indicators
    document.querySelectorAll(".drop-indicator").forEach(el => {
      el.classList.remove("drop-indicator", "drop-indicator-top", "drop-indicator-bottom")
    })
    
    if (candidate && draggedCandidate?.id !== candidate.id) {
      const rect = e.currentTarget.getBoundingClientRect()
      const midPoint = rect.top + rect.height / 2
      const position = e.clientY > midPoint ? "bottom" : "top"
      e.currentTarget.classList.add("drop-indicator", `drop-indicator-${position}`)
    }
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = ""
    setDraggedCandidate(null)
    setDragOverColumn(null)
    setDragOverCandidate(null)
    document.querySelectorAll(".drop-indicator").forEach(el => {
      el.classList.remove("drop-indicator", "drop-indicator-top", "drop-indicator-bottom")
    })
  }

  const handleDrop = async (e, stage) => {
    e.preventDefault()
    
    if (!draggedCandidate || draggedCandidate.stage === stage) {
      handleDragEnd(e)
      return
    }

    try {
      await onStageChange(draggedCandidate.id, stage)
    } catch (error) {
      console.error('Failed to update candidate stage:', error)
    }

    handleDragEnd(e)
  }

  // Group candidates by stage
  const candidatesByStage = stages.reduce((acc, stage) => {
    acc[stage] = candidates.filter(c => c.stage === stage)
    return acc
  }, {})

  return (
    <div className="kanban-board">
      {stages.map(stage => {
        const config = STAGE_CONFIG[stage]
        const stageCandidates = candidatesByStage[stage] || []
        const isOver = dragOverColumn === stage
        
        return (
          <div
            key={stage}
            className={`kanban-column ${isOver ? 'column-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, stage)}
            onDrop={(e) => handleDrop(e, stage)}
            style={{
              '--column-color': config.color
            }}
          >
            <div className="column-header">
              <h3>{config.label}</h3>
              <span className="candidate-count">{stageCandidates.length}</span>
            </div>
            <div className="column-description">{config.description}</div>
            
            <div className="candidates-container">
              {stageCandidates.map(candidate => (
                <div
                  key={candidate.id}
                  className={`candidate-card ${
                    draggedCandidate?.id === candidate.id ? 'dragging' :
                    dragOverCandidate?.id === candidate.id ? 'drag-over' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, candidate)}
                  onDragOver={(e) => handleDragOver(e, stage, candidate)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onCandidateSelect(candidate)}
                >
                  <div className="candidate-name">{candidate.name}</div>
                  <div className="candidate-email">{candidate.email}</div>
                  <div className="candidate-meta">
                    Applied: {new Date(candidate.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="kanban-board">
      {STAGES.map((stage) => (
        <div key={stage} className="kanban-column" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage)}>
          <h3 className="kanban-column-title">{stage}</h3>
          <div className="kanban-cards">
            {candidates
              .filter((c) => c.stage === stage)
              .map((candidate) => (
                <div
                  key={candidate.id}
                  className="kanban-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, candidate)}
                >
                  <Link to={`/candidates/${candidate.id}`} className="card-link">
                    <p className="card-name">{candidate.name}</p>
                    <p className="card-email">{candidate.email}</p>
                  </Link>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
