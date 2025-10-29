import { useState, useEffect } from "react"
import { useMutation } from "react-query"
import { QuestionType, ConditionalType } from "../../types"
import "./FormRuntime.css"

export default function FormRuntime({ assessment, candidateId, onSubmit, onSaveDraft }) {
  const [responses, setResponses] = useState({})
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load existing responses if available
  useEffect(() => {
    if (assessment?.responses) {
      setResponses(assessment.responses)
    }
  }, [assessment])

  const saveDraftMutation = useMutation(
    async (data) => {
      const response = await fetch(`/api/assessments/${assessment.jobId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          responses: data,
          status: "draft"
        }),
      })
      if (!response.ok) throw new Error("Failed to save draft")
      return response.json()
    },
    {
      onSuccess: () => {
        if (onSaveDraft) onSaveDraft()
      },
      onError: (error) => {
        console.error("Failed to save draft:", error)
      },
    },
  )

  const submitMutation = useMutation(
    async (data) => {
      const response = await fetch(`/api/assessments/${assessment.jobId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          responses: data,
          status: "submitted"
        }),
      })
      if (!response.ok) throw new Error("Failed to submit assessment")
      return response.json()
    },
    {
      onSuccess: () => {
        if (onSubmit) onSubmit()
      },
      onError: (error) => {
        console.error("Failed to submit assessment:", error)
      },
    },
  )

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
    
    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: null
      }))
    }

    // Auto-save draft after 3 seconds
    clearTimeout(window.autoSaveTimeout)
    window.autoSaveTimeout = setTimeout(() => {
      saveDraftMutation.mutate({ ...responses, [questionId]: value })
    }, 3000)
  }

  const validateQuestion = (question, value) => {
    const validation = question.validation
    if (!validation) return null

    // Required validation
    if (question.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return "This field is required"
    }

    if (!value) return null

    // Min/Max length validation
    if (validation.minLength && value.length < validation.minLength) {
      return `Must be at least ${validation.minLength} characters`
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      return `Must be no more than ${validation.maxLength} characters`
    }

    // Min/Max value validation
    if (validation.min !== undefined && parseFloat(value) < validation.min) {
      return `Must be at least ${validation.min}`
    }
    if (validation.max !== undefined && parseFloat(value) > validation.max) {
      return `Must be no more than ${validation.max}`
    }

    // Pattern validation
    if (validation.pattern) {
      const regex = new RegExp(validation.pattern)
      if (!regex.test(value)) {
        return "Invalid format"
      }
    }

    return null
  }

  const validateAllQuestions = () => {
    const newErrors = {}
    let isValid = true

    assessment.sections.forEach(section => {
      section.questions.forEach(question => {
        if (shouldShowQuestion(question)) {
          const value = responses[question.id]
          const error = validateQuestion(question, value)
          if (error) {
            newErrors[question.id] = error
            isValid = false
          }
        }
      })
    })

    setErrors(newErrors)
    return isValid
  }

  const shouldShowQuestion = (question) => {
    if (!question.conditional) return true

    const { dependsOn, condition, value: expectedValue } = question.conditional
    const dependentValue = responses[dependsOn]

    if (!dependentValue) return false

    switch (condition) {
      case ConditionalType.EQUALS:
        return dependentValue === expectedValue
      case ConditionalType.NOT_EQUALS:
        return dependentValue !== expectedValue
      case ConditionalType.CONTAINS:
        return String(dependentValue).toLowerCase().includes(String(expectedValue).toLowerCase())
      case ConditionalType.GREATER_THAN:
        return parseFloat(dependentValue) > parseFloat(expectedValue)
      case ConditionalType.LESS_THAN:
        return parseFloat(dependentValue) < parseFloat(expectedValue)
      case ConditionalType.IS_EMPTY:
        return !dependentValue || dependentValue === ""
      case ConditionalType.IS_NOT_EMPTY:
        return dependentValue && dependentValue !== ""
      default:
        return true
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateAllQuestions()) {
      setIsSubmitting(true)
      submitMutation.mutate(responses)
    }
  }

  const handleSaveDraft = () => {
    saveDraftMutation.mutate(responses)
  }

  const renderQuestion = (question) => {
    if (!shouldShowQuestion(question)) return null

    const value = responses[question.id] || ""
    const error = errors[question.id]

    return (
      <div key={question.id} className={`form-question ${error ? 'error' : ''}`}>
        <label className="question-label">
          {question.title}
          {question.required && <span className="required">*</span>}
        </label>
        
        {question.type === QuestionType.SHORT_TEXT && (
          <input
            type="text"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="form-input"
            placeholder="Enter your answer..."
            maxLength={question.validation?.maxLength}
            minLength={question.validation?.minLength}
            pattern={question.validation?.pattern}
          />
        )}

        {question.type === QuestionType.LONG_TEXT && (
          <textarea
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="form-textarea"
            placeholder="Enter your answer..."
            rows="4"
            maxLength={question.validation?.maxLength}
            minLength={question.validation?.minLength}
          />
        )}

        {question.type === QuestionType.SINGLE_CHOICE && (
          <div className="radio-group">
            {question.options?.map((option, idx) => (
              <label key={idx} className="radio-option">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                />
                <span className="radio-label">{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === QuestionType.MULTI_CHOICE && (
          <div className="checkbox-group">
            {question.options?.map((option, idx) => (
              <label key={idx} className="checkbox-option">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : []
                    if (e.target.checked) {
                      handleResponseChange(question.id, [...currentValues, option])
                    } else {
                      handleResponseChange(question.id, currentValues.filter(v => v !== option))
                    }
                  }}
                />
                <span className="checkbox-label">{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === QuestionType.NUMERIC && (
          <input
            type="number"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="form-input"
            placeholder="Enter a number..."
            min={question.validation?.min}
            max={question.validation?.max}
            step="any"
          />
        )}

        {question.type === QuestionType.FILE_UPLOAD && (
          <div className="file-upload">
            <input
              type="file"
              onChange={(e) => handleResponseChange(question.id, e.target.files[0]?.name || "")}
              className="form-input"
            />
            <small className="file-upload-help">
              Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
            </small>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    )
  }

  if (!assessment) {
    return <div className="form-runtime-error">No assessment found</div>
  }

  return (
    <div className="form-runtime">
      <div className="form-header">
        <h2>{assessment.title}</h2>
        {assessment.description && (
          <p className="form-description">{assessment.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="assessment-form">
        {assessment.sections.map((section) => (
          <div key={section.id} className="form-section">
            <h3 className="section-title">{section.title}</h3>
            {section.description && (
              <p className="section-description">{section.description}</p>
            )}
            <div className="section-questions">
              {section.questions.map(renderQuestion)}
            </div>
          </div>
        ))}

        <div className="form-actions">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="btn btn-secondary"
            disabled={saveDraftMutation.isLoading}
          >
            {saveDraftMutation.isLoading ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitMutation.isLoading || isSubmitting}
          >
            {submitMutation.isLoading || isSubmitting ? "Submitting..." : "Submit Assessment"}
          </button>
        </div>
      </form>
    </div>
  )
}

