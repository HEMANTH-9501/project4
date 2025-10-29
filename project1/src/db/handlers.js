export const reorderHandler = async ({ id, fromOrder, toOrder }) => {
  // Get all jobs sorted by order
  const jobs = await db.jobs.orderBy('order').toArray()
  
  // Find affected range
  const start = Math.min(fromOrder, toOrder)
  const end = Math.max(fromOrder, toOrder)
  
  // Get jobs in affected range
  const affectedJobs = jobs.filter(job => job.order >= start && job.order <= end)
  
  // Update orders
  const updates = affectedJobs.map(job => {
    let newOrder = job.order
    if (fromOrder < toOrder) {
      // Moving down
      if (job.order === fromOrder) newOrder = toOrder
      else if (job.order <= toOrder) newOrder = job.order - 1
    } else {
      // Moving up 
      if (job.order === fromOrder) newOrder = toOrder
      else if (job.order >= toOrder) newOrder = job.order + 1
    }
    return { ...job, order: newOrder }
  })
  
  // Persist changes
  await db.transaction('rw', db.jobs, async () => {
    for (const job of updates) {
      await db.jobs.put(job)
    }
  })
}

export const getJobHandler = async (id) => {
  const job = await db.jobs.get(id)
  if (!job) throw new Error('Job not found')
  return job
}

export const createJobHandler = async (data) => {
  // Get max order
  const maxOrder = await db.jobs.orderBy('order').last()
  const order = maxOrder ? maxOrder.order + 1 : 0

  const job = {
    ...data,
    order,
    createdAt: new Date().toISOString()
  }

  const id = await db.jobs.add(job)
  return { ...job, id }
}

export const updateJobHandler = async (id, data) => {
  const job = await db.jobs.get(id)
  if (!job) throw new Error('Job not found')

  const updated = { ...job, ...data }
  await db.jobs.put(updated)
  return updated
}

export const createCandidateHandler = async (data) => {
  const candidate = {
    ...data,
    createdAt: new Date().toISOString()
  }

  const id = await db.candidates.add(candidate)
  return { ...candidate, id }
}

export const updateCandidateStageHandler = async (id, stage) => {
  const candidate = await db.candidates.get(id)
  if (!candidate) throw new Error('Candidate not found')

  // Update candidate stage
  const updated = { ...candidate, stage }
  await db.candidates.put(updated)

  // Add timeline entry
  await db.timeline.add({
    candidateId: id,
    type: 'STAGE_CHANGE',
    data: { from: candidate.stage, to: stage },
    timestamp: new Date().toISOString()
  })

  return updated
}

export const getCandidateTimelineHandler = async (id) => {
  const timeline = await db.timeline
    .where('candidateId')
    .equals(id)
    .reverse()
    .sortBy('timestamp')
  return timeline
}

export const getAssessmentHandler = async (jobId) => {
  const assessment = await db.assessments
    .where('[jobId+id]')
    .equals([jobId])
    .first()
  return assessment
}

export const updateAssessmentHandler = async (jobId, data) => {
  const assessment = {
    ...data,
    jobId,
    updatedAt: new Date().toISOString()
  }

  await db.assessments.put(assessment)
  return assessment
}

export const submitAssessmentHandler = async (jobId, candidateId, data) => {
  const response = {
    assessmentId: jobId,
    candidateId,
    data,
    submittedAt: new Date().toISOString()
  }

  await db.responses.put(response)
  
  // Add timeline entry
  await db.timeline.add({
    candidateId,
    type: 'ASSESSMENT_SUBMITTED',
    data: { jobId },
    timestamp: new Date().toISOString()
  })

  return response
}