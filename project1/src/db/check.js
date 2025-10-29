"use client"

import { db } from "./index"

export async function checkDatabase() {
  const jobs = await db.jobs.toArray()
  const candidates = await db.candidates.toArray()
  console.log("Database status:", {
    jobs: {
      count: jobs.length,
      sample: jobs.slice(0, 2)
    },
    candidates: {
      count: candidates.length,
      sample: candidates.slice(0, 2)
    }
  })
}