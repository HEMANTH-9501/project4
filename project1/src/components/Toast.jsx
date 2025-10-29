import "./Toast.css"

export default function Toast({ id, message, type, onRemove }) {
  // Defensive: ensure message is a string
  let displayMessage = message
  if (typeof message === 'object' && message !== null) {
    displayMessage = message.message || JSON.stringify(message)
  }
  return (
    <div className={`toast toast-${type}`}>
      <span>{displayMessage}</span>
      <button className="toast-close" onClick={() => onRemove(id)}>
        ×
      </button>
    </div>
  )
}
