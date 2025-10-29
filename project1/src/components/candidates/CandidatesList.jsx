import { useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import "./CandidatesList.css"

const STAGES = {
  applied: { label: "Applied", color: "#f59e0b" },
  screen: { label: "Screening", color: "#3b82f6" },
  tech: { label: "Technical", color: "#10b981" },
  offer: { label: "Offer", color: "#8b5cf6" },
  hired: { label: "Hired", color: "#059669" },
  rejected: { label: "Rejected", color: "#ef4444" },
}

export default function CandidatesList({
  candidates = [],
  isLoading,
  onSelect,
  onStageChange,
  virtualListRef,
  setVirtualListRef,
}) {
  const rowVirtualizer = useVirtualizer({
    count: candidates.length,
    getScrollElement: () => virtualListRef,
    estimateSize: useCallback(() => 60, []),
    overscan: 5,
  })

  if (isLoading) {
    return <div className="candidates-loading">Loading candidates...</div>
  }

  if (!candidates.length) {
    return <div className="candidates-empty">No candidates found</div>
  }

  return (
    <div 
      ref={setVirtualListRef}
      className="candidates-list"
      style={{ height: "100%", overflow: "auto" }}
    >
      <div className="list-header">
        <div className="header-name">Name</div>
        <div className="header-email">Email</div>
        <div className="header-stage">Stage</div>
        <div className="header-date">Applied Date</div>
      </div>

      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const candidate = candidates[virtualRow.index]
          return (
            <div
              key={candidate.id}
              className="candidate-row"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              onClick={() => onSelect(candidate)}
            >
              <div className="candidate-name">{candidate.name}</div>
              <div className="candidate-email">{candidate.email}</div>
              <div className="stage-selector">
                <select
                  value={candidate.stage}
                  onChange={(e) => {
                    e.stopPropagation()
                    onStageChange(candidate.id, e.target.value)
                  }}
                  style={{
                    borderColor: STAGES[candidate.stage].color,
                    color: STAGES[candidate.stage].color,
                  }}
                >
                  {Object.entries(STAGES).map(([value, { label }]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="candidate-date">
                {new Date(candidate.createdAt).toLocaleDateString()}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
