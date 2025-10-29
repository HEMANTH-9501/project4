import Dexie, { Table } from "dexie"

interface Job {
  id?: number
  title: string
  slug: string
  status: "active" | "archived"
  order: number
  tags: string[]
  createdAt: string
}

interface Candidate {
  id?: number
  name: string
  email: string
  stage: string
  jobId: number
  createdAt: string
}

interface Timeline {
  id?: number
  candidateId: number
  type: string
  data: any
  timestamp: string
}

interface Question {
  id: string
  type: "short_text" | "long_text" | "single_choice" | "multi_choice" | "numeric" | "file_upload"
  title: string
  required: boolean
  options?: string[]
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
  }
  conditional?: {
    dependsOn: string
    condition: string
    value: any
  }
  order: number
}

interface Section {
  id: string
  title: string
  description?: string
  questions: Question[]
  order: number
}

interface Assessment {
  jobId: number
  id: number
  title: string
  description?: string
  sections: Section[]
  createdAt: string
  updatedAt?: string
}

interface AssessmentResponse {
  id?: number
  candidateId: number
  assessmentId: number
  jobId: number
  responses: Record<string, any>
  submittedAt: string
  status: "draft" | "submitted"
}

interface Note {
  id?: number
  candidateId: number
  content: string
  createdBy: string
  mentions: string[]
  createdAt: string
}

class TalentFlowDB extends Dexie {
  jobs!: Table<Job>
  candidates!: Table<Candidate>
  assessments!: Table<Assessment>
  responses!: Table<AssessmentResponse>
  notes!: Table<Note>
  timeline!: Table<Timeline>

  constructor() {
    super("TalentFlowDB")
    this.version(2).stores({
      jobs: "++id, title, slug, status, order, tags",
      candidates: "++id, name, email, stage, jobId, createdAt",
      assessments: "[jobId+id], title, sections, createdAt, updatedAt",
      responses: "[candidateId+assessmentId], jobId, responses, submittedAt, status",
      notes: "++id, candidateId, content, createdBy, mentions, createdAt",
      timeline: "++id, candidateId, type, data, timestamp"
    })
  }
}

export const db = new TalentFlowDB()
export default db