// ...existing code, but only one set of imports, variables, and handlers array...
import { http, HttpResponse } from "msw"
import { db } from "../db/index"
import {
  reorderHandler,
  getJobHandler,
  createJobHandler,
  updateJobHandler,
  createCandidateHandler,
  updateCandidateStageHandler,
  getCandidateTimelineHandler,
  getAssessmentHandler,
  updateAssessmentHandler,
  submitAssessmentHandler
} from "../db/handlers"

const LATENCY = () => Math.random() * 500 + 100
const ERROR_RATE = 0.01

const simulateLatency = async () => {
  await new Promise((resolve) => setTimeout(resolve, LATENCY()))
}

const shouldError = () => Math.random() < ERROR_RATE

export const handlers = [
  // Assessment endpoints
  http.get("/api/assessments/:jobId", async ({ params }) => {
    await simulateLatency()
    const jobId = Number(params.jobId)
    let assessment = await db.assessments.where("jobId").equals(jobId).first()
    if (!assessment) {
      // Return a default empty assessment if not found
      assessment = {
        jobId,
        id: jobId,
        title: "Untitled Assessment",
        sections: [],
        createdAt: new Date().toISOString()
      }
    }
    return new HttpResponse(JSON.stringify(assessment))
  }),
  // Jobs endpoints
  http.get("/api/jobs", async ({ request }) => {
    await simulateLatency()
    if (shouldError()) {
      return new HttpResponse(JSON.stringify({ error: "Server error" }), { status: 500 })
    }

    try {
      const url = new URL(request.url)
      const page = Number.parseInt(url.searchParams.get("page") || "1")
      const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "10")
      const search = url.searchParams.get("search") || ""
      const status = url.searchParams.get("status") || ""

      let jobs = await db.jobs.toArray()

      if (search) {
        jobs = jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()))
      }

      if (status) {
        jobs = jobs.filter(j => j.status === status)
      }

      jobs.sort((a, b) => a.order - b.order)

      const total = jobs.length
      const start = (page - 1) * pageSize
      const paginatedJobs = jobs.slice(start, start + pageSize)

      return new HttpResponse(JSON.stringify({
        jobs: paginatedJobs,
        total,
        page,
        pageSize,
        hasMore: start + pageSize < total,
      }))
    } catch (error) {
      console.error("Error fetching jobs:", error)
      return new HttpResponse(JSON.stringify({ error: "Server error" }), { status: 500 })
    }
  }),

  http.post("/api/jobs", async ({ request }) => {
    await simulateLatency()
    if (shouldError()) {
      return new HttpResponse(JSON.stringify({ error: "Server error" }), { status: 500 })
    }

    try {
      const data = await request.json()
      const maxOrderJob = await db.jobs.orderBy("order").last()
      const order = maxOrderJob ? maxOrderJob.order + 1 : 0

      const job = {
        ...data,
        id: Date.now(),
        order,
        createdAt: new Date().toISOString(),
      }

      const id = await db.jobs.add(job)
      const created = await db.jobs.get(id)
      return new HttpResponse(JSON.stringify(created), { status: 201 })
    } catch (error) {
      console.error("Error creating job:", error)
      return new HttpResponse(JSON.stringify({ error: "Server error" }), { status: 500 })
    }
  }),

  // Assessment endpoints
  http.put("/api/assessments/:jobId", async ({ params, request }) => {
    await simulateLatency()
    if (shouldError()) {
      return new HttpResponse(JSON.stringify({ error: "Server error" }), { status: 500 })
    }

    try {
      const jobId = Number(params.jobId)
      const data = await request.json()
      
      // Save assessment to IndexedDB
      const assessment = {
        ...data,
        jobId,
        id: jobId,
        updatedAt: new Date().toISOString(),
      }
      await db.assessments.put(assessment)
      return new HttpResponse(JSON.stringify(assessment))
    } catch (error) {
      console.error("Error updating assessment:", error)
      return new HttpResponse(JSON.stringify({ error: "Server error" }), { status: 500 })
    }
  }),

  http.post("/api/assessments/:jobId/submit", async ({ params, request }) => {
    await simulateLatency()
    if (shouldError()) {
      return new HttpResponse(JSON.stringify({ error: "Server error" }), { status: 500 })
    }

    try {
      const jobId = Number(params.jobId)
      const data = await request.json()
      
      // Save assessment response to IndexedDB
      const response = {
        ...data,
        jobId,
        id: Date.now(),
        submittedAt: new Date().toISOString(),
      }
      await db.responses.put(response)
      return new HttpResponse(JSON.stringify(response))
    } catch (error) {
      console.error("Error submitting assessment:", error)
      return new HttpResponse(JSON.stringify({ error: "Server error" }), { status: 500 })
    }
  }),

  // Candidates endpoints
  http.get("/api/candidates", async ({ request }) => {
    await simulateLatency()
    if (shouldError()) {
      return new HttpResponse(JSON.stringify({ error: "Server error" }), { status: 500 })
    }

    try {
      const url = new URL(request.url)
      const page = Number.parseInt(url.searchParams.get("page") || "1")
      const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "10")
      const search = url.searchParams.get("search") || ""
      const stage = url.searchParams.get("stage") || ""

      let candidates = await db.candidates.toArray()

      if (search) {
        candidates = candidates.filter((c) => 
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
        )
      }

      if (stage) {
        candidates = candidates.filter((c) => c.stage === stage)
      }

      candidates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      const total = candidates.length
      const start = (page - 1) * pageSize
      const paginatedCandidates = candidates.slice(start, start + pageSize)

      return new HttpResponse(JSON.stringify({
        candidates: paginatedCandidates,
        total,
        page,
        pageSize,
        hasMore: start + pageSize < total,
      }))
    } catch (error) {
      console.error("Error fetching candidates:", error)
      return new HttpResponse(JSON.stringify({ error: "Server error" }), { status: 500 })
    }
  }),

  http.patch("/api/jobs/:id", async ({ params, request }) => {
    await simulateLatency()
    if (shouldError()) {
      return new HttpResponse(JSON.stringify({ error: "Server error" }), { status: 500 })
    }

    try {
      const jobId = Number(params.id)
      const data = await request.json()
      
      // Update job in IndexedDB
      const existingJob = await db.jobs.get(jobId)
      if (!existingJob) {
        return new HttpResponse(JSON.stringify({ error: "Job not found" }), { status: 404 })
      }

      const updatedJob = {
        ...existingJob,
        ...data,
        updatedAt: new Date().toISOString()
      }
      
      await db.jobs.put(updatedJob)
      return new HttpResponse(JSON.stringify(updatedJob))
    } catch (error) {
      console.error("Error updating job:", error)
      return new HttpResponse(JSON.stringify({ error: "Server error" }), { status: 500 })
    }
  }),

  http.patch("/api/jobs/reorder", reorderHandler),
  http.get("/api/candidates/:candidateId/timeline", getCandidateTimelineHandler),
  http.get("/api/candidates/:candidateId/assessment", getAssessmentHandler),
  http.patch("/api/candidates/:candidateId", updateCandidateStageHandler),
  http.patch("/api/assessment/:assessmentId", updateAssessmentHandler),
  http.post("/api/assessment/:assessmentId/submit", submitAssessmentHandler)
]