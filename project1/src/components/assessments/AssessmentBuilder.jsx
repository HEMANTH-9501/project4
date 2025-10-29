import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "react-query"
import { v4 as uuidv4 } from "uuid"
import { QuestionType, ValidationType, ConditionalType } from "../../types"
import "./AssessmentBuilder.css"

const QUESTION_TYPES = [
  { value: QuestionType.SHORT_TEXT, label: "Short Text" },
  { value: QuestionType.LONG_TEXT, label: "Long Text" },
  { value: QuestionType.SINGLE_CHOICE, label: "Single Choice" },
  { value: QuestionType.MULTI_CHOICE, label: "Multi Choice" },
  { value: QuestionType.NUMERIC, label: "Numeric" },
  { value: QuestionType.FILE_UPLOAD, label: "File Upload" },
]

const CONDITIONAL_OPERATORS = [
  { value: ConditionalType.EQUALS, label: "Equals" },
  { value: ConditionalType.NOT_EQUALS, label: "Not Equals" },
  { value: ConditionalType.CONTAINS, label: "Contains" },
  { value: ConditionalType.GREATER_THAN, label: "Greater Than" },
  { value: ConditionalType.LESS_THAN, label: "Less Than" },
  { value: ConditionalType.IS_EMPTY, label: "Is Empty" },
  { value: ConditionalType.IS_NOT_EMPTY, label: "Is Not Empty" },
]

export default function AssessmentBuilder({ jobId, assessment, addToast }) {
  console.log('AssessmentBuilder rendering with:', { jobId, assessment, addToast })
  
  const [assessmentData, setAssessmentData] = useState({
    title: assessment?.title || "Untitled Assessment",
    description: assessment?.description || "",
    sections: assessment?.sections || []
  })
  const [previewMode, setPreviewMode] = useState(false)
  const [selectedSection, setSelectedSection] = useState(null)
  const queryClient = useQueryClient()

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (assessmentData.sections.length > 0) {
        saveAssessment()
      }
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSave)
  }, [assessmentData])

  const saveMutation = useMutation(
    async (data) => {
      const response = await fetch(`/api/assessments/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to save assessment")
      return response.json()
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["assessment", jobId])
        addToast("Assessment auto-saved", "success")
      },
      onError: () => addToast("Failed to save assessment", "error"),
    },
  )

  const saveAssessment = () => {
    saveMutation.mutate(assessmentData)
  }

  const handleAddSection = () => {
    const newSection = {
      id: uuidv4(),
        title: "New Section",
      description: "",
        questions: [],
      order: assessmentData.sections.length
    }
    setAssessmentData({
      ...assessmentData,
      sections: [...assessmentData.sections, newSection]
    })
    setSelectedSection(newSection.id)
  }

  const handleRemoveSection = (sectionId) => {
    setAssessmentData({
      ...assessmentData,
      sections: assessmentData.sections.filter(s => s.id !== sectionId)
    })
    if (selectedSection === sectionId) {
      setSelectedSection(null)
    }
  }

  const handleMoveSection = (sectionId, direction) => {
    const sections = [...assessmentData.sections]
    const idx = sections.findIndex(s => s.id === sectionId)
    if (idx < 0) return
    
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= sections.length) return
    
    const [removed] = sections.splice(idx, 1)
    sections.splice(newIdx, 0, removed)
    
    // Update order values
    sections.forEach((section, index) => {
      section.order = index
    })
    
    setAssessmentData({ ...assessmentData, sections })
  }

  const handleSectionChange = (sectionId, field, value) => {
    setAssessmentData({
      ...assessmentData,
      sections: assessmentData.sections.map(s =>
        s.id === sectionId ? { ...s, [field]: value } : s
      )
    })
  }

  const handleAddQuestion = (sectionId) => {
    const section = assessmentData.sections.find(s => s.id === sectionId)
    if (!section) return

    const newQuestion = {
      id: uuidv4(),
      type: QuestionType.SHORT_TEXT,
      title: "New Question",
      required: false,
      options: [],
      validation: {},
      conditional: null,
      order: section.questions.length
    }

    setAssessmentData({
      ...assessmentData,
      sections: assessmentData.sections.map(s =>
        s.id === sectionId
          ? { ...s, questions: [...s.questions, newQuestion] }
          : s
      )
    })
  }

  const handleRemoveQuestion = (sectionId, questionId) => {
    setAssessmentData({
      ...assessmentData,
      sections: assessmentData.sections.map(s =>
        s.id === sectionId
          ? { ...s, questions: s.questions.filter(q => q.id !== questionId) }
          : s
    )
    })
  }

  const handleMoveQuestion = (sectionId, questionId, direction) => {
    setAssessmentData({
      ...assessmentData,
      sections: assessmentData.sections.map(s => {
        if (s.id !== sectionId) return s
        
        const questions = [...s.questions]
        const idx = questions.findIndex(q => q.id === questionId)
        if (idx < 0) return s
        
        const newIdx = idx + direction
        if (newIdx < 0 || newIdx >= questions.length) return s
        
        const [removed] = questions.splice(idx, 1)
        questions.splice(newIdx, 0, removed)
        
        // Update order values
        questions.forEach((question, index) => {
          question.order = index
        })
        
        return { ...s, questions }
      })
    })
  }

  const handleQuestionChange = (sectionId, questionId, field, value) => {
    setAssessmentData({
      ...assessmentData,
      sections: assessmentData.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map(q =>
                q.id === questionId ? { ...q, [field]: value } : q
              )
            }
          : s
      )
    })
  }

  const handleValidationChange = (sectionId, questionId, validation) => {
    setAssessmentData({
      ...assessmentData,
      sections: assessmentData.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map(q =>
                q.id === questionId ? { ...q, validation } : q
              )
            }
          : s
      )
    })
  }

  const handleConditionalChange = (sectionId, questionId, conditional) => {
    setAssessmentData({
      ...assessmentData,
      sections: assessmentData.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map(q =>
                q.id === questionId ? { ...q, conditional } : q
              )
            }
          : s
      )
    })
  }

  const handleOptionChange = (sectionId, questionId, options) => {
    setAssessmentData({
      ...assessmentData,
      sections: assessmentData.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map(q =>
                q.id === questionId ? { ...q, options } : q
              )
            }
          : s
      )
    })
  }

  const getAvailableQuestions = (currentSectionId, currentQuestionId) => {
    const allQuestions = []
    assessmentData.sections.forEach(section => {
      if (section.id !== currentSectionId) {
        section.questions.forEach(question => {
          allQuestions.push({
            id: question.id,
            title: question.title,
            sectionTitle: section.title
          })
        })
      } else {
        section.questions.forEach(question => {
          if (question.id !== currentQuestionId) {
            allQuestions.push({
              id: question.id,
              title: question.title,
              sectionTitle: section.title
            })
          }
        })
      }
    })
    return allQuestions
  }

  const renderQuestionEditor = (section, question) => {
    const availableQuestions = getAvailableQuestions(section.id, question.id)
    
    return (
      <div key={question.id} className="question-editor">
        <div className="question-header">
          <input
            type="text"
            value={question.title}
            onChange={(e) => handleQuestionChange(section.id, question.id, 'title', e.target.value)}
            className="question-title-input"
            placeholder="Question title"
          />
          <div className="question-controls">
            <select
              value={question.type}
              onChange={(e) => {
                const newType = e.target.value
                const newQuestion = { ...question, type: newType }
                if (newType === QuestionType.SINGLE_CHOICE || newType === QuestionType.MULTI_CHOICE) {
                  newQuestion.options = question.options?.length ? question.options : ['Option 1']
                } else {
                  newQuestion.options = []
                }
                handleQuestionChange(section.id, question.id, 'type', newType)
                handleQuestionChange(section.id, question.id, 'options', newQuestion.options)
              }}
              className="question-type-select"
            >
              {QUESTION_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => handleQuestionChange(section.id, question.id, 'required', e.target.checked)}
              />
              Required
            </label>
            <button 
              className="btn btn-xs" 
              onClick={() => handleRemoveQuestion(section.id, question.id)}
              title="Remove Question"
            >
              🗑️
            </button>
            <button 
              className="btn btn-xs" 
              onClick={() => handleMoveQuestion(section.id, question.id, -1)}
              disabled={section.questions.indexOf(question) === 0}
              title="Move Up"
            >
              ↑
            </button>
            <button 
              className="btn btn-xs" 
              onClick={() => handleMoveQuestion(section.id, question.id, 1)}
              disabled={section.questions.indexOf(question) === section.questions.length - 1}
              title="Move Down"
            >
              ↓
            </button>
          </div>
        </div>

        {/* Options editor for choice questions */}
        {(question.type === QuestionType.SINGLE_CHOICE || question.type === QuestionType.MULTI_CHOICE) && (
          <div className="options-editor">
            <label>Options:</label>
            {question.options?.map((option, optIdx) => (
              <div key={optIdx} className="option-row">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...question.options]
                    newOptions[optIdx] = e.target.value
                    handleOptionChange(section.id, question.id, newOptions)
                  }}
                  placeholder="Option text"
                />
                <button 
                  className="btn btn-xs" 
                  onClick={() => {
                    const newOptions = question.options.filter((_, i) => i !== optIdx)
                    handleOptionChange(section.id, question.id, newOptions)
                  }}
                  title="Remove Option"
                >
                  🗑️
                </button>
              </div>
            ))}
            <button 
              className="btn btn-xs" 
              onClick={() => {
                const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`]
                handleOptionChange(section.id, question.id, newOptions)
              }}
            >
              Add Option
            </button>
          </div>
        )}

        {/* Validation rules */}
        <div className="validation-editor">
          <label>Validation Rules:</label>
          <div className="validation-rules">
            {question.type === QuestionType.SHORT_TEXT || question.type === QuestionType.LONG_TEXT ? (
              <>
                <div className="validation-rule">
                  <label>Min Length:</label>
                  <input
                    type="number"
                    value={question.validation?.minLength || ''}
                    onChange={(e) => handleValidationChange(section.id, question.id, {
                      ...question.validation,
                      minLength: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    placeholder="Min characters"
                  />
                </div>
                <div className="validation-rule">
                  <label>Max Length:</label>
                  <input
                    type="number"
                    value={question.validation?.maxLength || ''}
                    onChange={(e) => handleValidationChange(section.id, question.id, {
                      ...question.validation,
                      maxLength: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    placeholder="Max characters"
                  />
                </div>
                <div className="validation-rule">
                  <label>Pattern (Regex):</label>
                  <input
                    type="text"
                    value={question.validation?.pattern || ''}
                    onChange={(e) => handleValidationChange(section.id, question.id, {
                      ...question.validation,
                      pattern: e.target.value || undefined
                    })}
                    placeholder="^[a-zA-Z0-9]+$"
                  />
                </div>
              </>
            ) : question.type === QuestionType.NUMERIC ? (
              <>
                <div className="validation-rule">
                  <label>Min Value:</label>
                  <input
                    type="number"
                    value={question.validation?.min || ''}
                    onChange={(e) => handleValidationChange(section.id, question.id, {
                      ...question.validation,
                      min: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    placeholder="Minimum value"
                  />
                </div>
                <div className="validation-rule">
                  <label>Max Value:</label>
                  <input
                    type="number"
                    value={question.validation?.max || ''}
                    onChange={(e) => handleValidationChange(section.id, question.id, {
                      ...question.validation,
                      max: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    placeholder="Maximum value"
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Conditional logic */}
        <div className="conditional-editor">
          <label>
            <input
              type="checkbox"
              checked={!!question.conditional}
              onChange={(e) => {
                if (e.target.checked) {
                  handleConditionalChange(section.id, question.id, {
                    dependsOn: '',
                    condition: ConditionalType.EQUALS,
                    value: ''
                  })
                } else {
                  handleConditionalChange(section.id, question.id, null)
                }
              }}
            />
            Show this question conditionally
          </label>
          {question.conditional && (
            <div className="conditional-rules">
              <div className="conditional-rule">
                <label>Depends on:</label>
                <select
                  value={question.conditional.dependsOn}
                  onChange={(e) => handleConditionalChange(section.id, question.id, {
                    ...question.conditional,
                    dependsOn: e.target.value
                  })}
                >
                  <option value="">Select question...</option>
                  {availableQuestions.map(q => (
                    <option key={q.id} value={q.id}>
                      {q.sectionTitle}: {q.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="conditional-rule">
                <label>Condition:</label>
                <select
                  value={question.conditional.condition}
                  onChange={(e) => handleConditionalChange(section.id, question.id, {
                    ...question.conditional,
                    condition: e.target.value
                  })}
                >
                  {CONDITIONAL_OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="conditional-rule">
                <label>Value:</label>
                <input
                  type="text"
                  value={question.conditional.value}
                  onChange={(e) => handleConditionalChange(section.id, question.id, {
                    ...question.conditional,
                    value: e.target.value
                  })}
                  placeholder="Expected value"
                />
              </div>
            </div>
          )}
        </div>

        {/* File upload stub info */}
        {question.type === QuestionType.FILE_UPLOAD && (
          <div className="file-upload-stub">
            <em>File upload will be available at runtime. Configure file type restrictions and size limits here.</em>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="assessment-builder">
      <div className="builder-header">
        <div className="assessment-meta">
          <input
            type="text"
            value={assessmentData.title}
            onChange={(e) => setAssessmentData({ ...assessmentData, title: e.target.value })}
            className="assessment-title-input"
            placeholder="Assessment title"
          />
          <textarea
            value={assessmentData.description}
            onChange={(e) => setAssessmentData({ ...assessmentData, description: e.target.value })}
            className="assessment-description-input"
            placeholder="Assessment description (optional)"
            rows="2"
          />
        </div>
      <div className="builder-toolbar">
        <button className="btn btn-primary" onClick={handleAddSection}>
          Add Section
        </button>
          <button 
            className={`btn ${previewMode ? "active" : ""}`} 
            onClick={() => setPreviewMode(!previewMode)}
          >
          {previewMode ? "Edit" : "Preview"}
        </button>
          <button 
            className="btn btn-primary" 
            onClick={saveAssessment} 
            disabled={saveMutation.isLoading}
          >
          {saveMutation.isLoading ? "Saving..." : "Save"}
        </button>
        </div>
      </div>

      <div className="builder-content">
        {previewMode ? (
          <div className="preview-pane">
            <h3>Live Preview</h3>
            <div className="preview-form">
              {assessmentData.sections.map((section) => (
              <div key={section.id} className="preview-section">
                  <h4>{section.title}</h4>
                  {section.description && <p className="section-description">{section.description}</p>}
                {section.questions.map((question) => (
                  <div key={question.id} className="preview-question">
                    <label>
                      {question.title}
                      {question.required && <span className="required">*</span>}
                    </label>
                      {question.type === QuestionType.SHORT_TEXT && (
                        <input 
                          type="text" 
                          placeholder="Answer..." 
                          className="form-input"
                          maxLength={question.validation?.maxLength}
                          minLength={question.validation?.minLength}
                          pattern={question.validation?.pattern}
                        />
                      )}
                      {question.type === QuestionType.LONG_TEXT && (
                        <textarea 
                          placeholder="Answer..." 
                          className="form-textarea"
                          maxLength={question.validation?.maxLength}
                          minLength={question.validation?.minLength}
                        />
                      )}
                      {question.type === QuestionType.SINGLE_CHOICE && (
                      <div className="options">
                          {question.options?.map((option, idx) => (
                            <label key={idx} className="radio-option">
                            <input type="radio" name={question.id} />
                            {option}
                          </label>
                        ))}
                      </div>
                    )}
                      {question.type === QuestionType.MULTI_CHOICE && (
                      <div className="options">
                          {question.options?.map((option, idx) => (
                            <label key={idx} className="checkbox-option">
                            <input type="checkbox" />
                            {option}
                          </label>
                        ))}
                      </div>
                    )}
                      {question.type === QuestionType.NUMERIC && (
                        <input 
                          type="number" 
                          placeholder="Enter number..." 
                          className="form-input"
                          min={question.validation?.min}
                          max={question.validation?.max}
                        />
                      )}
                      {question.type === QuestionType.FILE_UPLOAD && (
                        <input type="file" className="form-input" />
                      )}
                  </div>
                ))}
              </div>
            ))}
            </div>
          </div>
        ) : (
          <div className="edit-pane">
            {assessmentData.sections.length === 0 ? (
              <div className="empty-state">
                <p>No sections yet. Click "Add Section" to get started.</p>
              </div>
            ) : (
              assessmentData.sections.map((section, sectionIdx) => (
              <div key={section.id} className="section-editor">
                  <div className="section-header">
                    <div className="section-meta">
                  <input
                    type="text"
                    value={section.title}
                        onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)}
                    className="section-title-input"
                        placeholder="Section title"
                      />
                      <textarea
                        value={section.description}
                        onChange={(e) => handleSectionChange(section.id, 'description', e.target.value)}
                        className="section-description-input"
                        placeholder="Section description (optional)"
                        rows="2"
                      />
                </div>
                    <div className="section-controls">
                      <button 
                        className="btn btn-sm" 
                        onClick={() => handleRemoveSection(section.id)}
                        title="Remove Section"
                      >
                        🗑️
                      </button>
                      <button 
                        className="btn btn-sm" 
                        onClick={() => handleMoveSection(section.id, -1)}
                        disabled={sectionIdx === 0}
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button 
                        className="btn btn-sm" 
                        onClick={() => handleMoveSection(section.id, 1)}
                        disabled={sectionIdx === assessmentData.sections.length - 1}
                        title="Move Down"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                  
                  <div className="questions-list">
                    {section.questions.map((question) => renderQuestionEditor(section, question))}
                </div>
                  
                  <button 
                    className="btn btn-sm add-question-btn" 
                    onClick={() => handleAddQuestion(section.id)}
                  >
                  Add Question
                </button>
              </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}