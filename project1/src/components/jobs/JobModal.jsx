"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "react-query"
import "./JobModal.css"

export default function JobModal({ job, onClose, onSave, addToast }) {
  const [formData, setFormData] = useState(
    job || {
      title: "",
      slug: "",
      description: "",
      tags: [],
      status: "active",
    },
  )
  const [tagInput, setTagInput] = useState("")
  const queryClient = useQueryClient()

  const saveMutation = useMutation(
    async (data) => {
      const url = job ? `/api/jobs/${job.id}` : "/api/jobs"
      console.log(url);
      const method = job ? "PATCH" : "POST"
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      console.log(response);
      if (!response.ok) throw new Error("Failed to save job")
      return response.json()
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("jobs")
        onSave()
      },
      onError: () => addToast("Failed to save job", "error"),
    },
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      addToast("Title is required", "error")
      return
    }
    
    // Auto-generate slug if not provided
    const dataToSave = {
      ...formData,
      slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }
    
    saveMutation.mutate(dataToSave)
  }

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <h2>{job ? "Edit Job" : "Create New Job"}</h2>
            <p className="modal-subtitle">
              {job ? "Update job details and settings" : "Fill in the details to create a new job posting"}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} title="Close modal">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="job-title">Job Title *</label>
            <input
              id="job-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input"
              placeholder="e.g., Senior React Developer"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="job-slug">URL Slug</label>
            <input
              id="job-slug"
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="form-input"
              placeholder="e.g., senior-react-developer"
            />
            <small className="form-help">Leave empty to auto-generate from title</small>
          </div>

          <div className="form-group">
            <label htmlFor="job-status">Status</label>
            <select
              id="job-status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="form-select"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="job-description">Description</label>
            <textarea
              id="job-description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-textarea"
              placeholder="Describe the role, responsibilities, and requirements..."
              rows="4"
            />
          </div>
          
          <div className="form-group">
            <label>Tags</label>
            <div className="tag-input-group">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                className="form-input"
                placeholder="Add a tag (e.g., remote, full-time)..."
              />
              <button type="button" onClick={handleAddTag} className="btn btn-sm btn-add-tag">
                Add Tag
              </button>
            </div>
            <div className="tags-list">
              {formData.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="tag-remove" title="Remove tag">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <small className="form-help">Add tags to help categorize and filter jobs</small>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saveMutation.isLoading}>
              {saveMutation.isLoading ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : (
                job ? "Update Job" : "Create Job"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
