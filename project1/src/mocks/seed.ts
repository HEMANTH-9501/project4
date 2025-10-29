import { db } from "../db/index"
import { v4 as uuidv4 } from "uuid"
import { QuestionType, ConditionalType } from "../types"

const JOB_TITLES = [
  "Senior React Developer",
  "Full Stack Engineer",
  "Product Manager",
  "UX Designer",
  "DevOps Engineer",
  "Data Scientist",
  "Backend Developer",
  "Frontend Developer",
  "Mobile Developer",
  "QA Engineer",
  "Technical Writer",
  "Solutions Architect",
  "Engineering Manager",
  "Scrum Master",
  "Business Analyst",
  "System Administrator",
  "Cloud Engineer",
  "Security Engineer",
  "Machine Learning Engineer",
  "Blockchain Developer",
  "Game Developer",
  "iOS Developer",
  "Android Developer",
  "Python Developer",
  "Java Developer"
]

const CANDIDATE_NAMES = [
  "John Smith", "Jane Doe", "Bob Johnson", "Alice Williams", "Charlie Brown",
  "David Lee", "Emma Wilson", "Frank Miller", "Grace Taylor", "Henry Davis",
  "Ivy Chen", "Jack Anderson", "Kate Martinez", "Liam O'Brien", "Maya Patel",
  "Noah Kim", "Olivia Garcia", "Paul Rodriguez", "Quinn Thompson", "Rachel White"
]

const STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"]

const TAGS = ["remote", "full-time", "contract", "startup", "enterprise", "part-time", "internship", "freelance"]

async function createJobs() {
  const jobs = []
  for (let i = 0; i < 25; i++) {
    const job = {
      title: `${JOB_TITLES[i % JOB_TITLES.length]} ${Math.floor(i / JOB_TITLES.length) + 1}`,
      slug: `job-${i + 1}`,
      status: Math.random() > 0.4 ? "active" : "archived",
      order: i,
      tags: [TAGS[Math.floor(Math.random() * TAGS.length)]],
      createdAt: new Date().toISOString()
    }
    const id = await db.jobs.add(job)
    jobs.push({ ...job, id })
  }
  return jobs
}

async function createCandidates(jobs: any[]) {
  for (let i = 0; i < 1000; i++) {
    const firstName = CANDIDATE_NAMES[Math.floor(Math.random() * CANDIDATE_NAMES.length)].split(" ")[0]
    const lastName = CANDIDATE_NAMES[Math.floor(Math.random() * CANDIDATE_NAMES.length)].split(" ")[1]
    
    const candidate = {
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      stage: STAGES[Math.floor(Math.random() * STAGES.length)],
      jobId: jobs[Math.floor(Math.random() * jobs.length)].id,
      createdAt: new Date().toISOString()
    }
    
    const id = await db.candidates.add(candidate)
    
    await db.timeline.add({
      candidateId: id,
      type: "STAGE_CHANGE",
      data: { from: null, to: candidate.stage },
      timestamp: candidate.createdAt
    })
  }
}

function createAssessmentQuestions() {
  return [
    // Technical Skills Section
    {
      id: uuidv4(),
      type: QuestionType.SINGLE_CHOICE,
      title: "What is your primary programming language?",
      required: true,
      options: ["JavaScript", "Python", "Java", "C#", "Go", "Rust", "Other"],
      validation: {},
      conditional: null,
      order: 0
    },
    {
      id: uuidv4(),
      type: QuestionType.MULTI_CHOICE,
      title: "Which technologies have you worked with? (Select all that apply)",
      required: true,
      options: ["React", "Vue.js", "Angular", "Node.js", "Express", "Django", "Flask", "Spring Boot", "Docker", "Kubernetes", "AWS", "Azure", "GCP"],
      validation: {},
      conditional: null,
      order: 1
    },
    {
      id: uuidv4(),
      type: QuestionType.NUMERIC,
      title: "How many years of professional development experience do you have?",
      required: true,
      options: [],
      validation: { min: 0, max: 50 },
      conditional: null,
      order: 2
    },
    {
      id: uuidv4(),
      type: QuestionType.SHORT_TEXT,
      title: "What is your current job title?",
      required: true,
      options: [],
      validation: { minLength: 2, maxLength: 100 },
      conditional: null,
      order: 3
    },
    {
      id: uuidv4(),
      type: QuestionType.LONG_TEXT,
      title: "Describe a challenging technical problem you solved recently",
      required: true,
      options: [],
      validation: { minLength: 50, maxLength: 1000 },
      conditional: null,
      order: 4
    },
    {
      id: uuidv4(),
      type: QuestionType.SINGLE_CHOICE,
      title: "Do you have experience with version control systems?",
      required: true,
      options: ["Yes, extensively", "Yes, some experience", "No, but I'm willing to learn", "No"],
      validation: {},
      conditional: null,
      order: 5
    },
    {
      id: uuidv4(),
      type: QuestionType.LONG_TEXT,
      title: "Please describe your experience with Git and common workflows",
      required: false,
      options: [],
      validation: { minLength: 20, maxLength: 500 },
      conditional: {
        dependsOn: "git-experience",
        condition: ConditionalType.EQUALS,
        value: "Yes, extensively"
      },
      order: 6
    },
    {
      id: uuidv4(),
      type: QuestionType.SINGLE_CHOICE,
      title: "Are you comfortable working in an Agile/Scrum environment?",
      required: true,
      options: ["Yes, very comfortable", "Yes, somewhat comfortable", "No, but I'm willing to learn", "No"],
      validation: {},
      conditional: null,
      order: 7
    },
    {
      id: uuidv4(),
      type: QuestionType.MULTI_CHOICE,
      title: "Which testing methodologies are you familiar with?",
      required: false,
      options: ["Unit Testing", "Integration Testing", "End-to-End Testing", "TDD (Test-Driven Development)", "BDD (Behavior-Driven Development)", "Performance Testing", "Security Testing"],
      validation: {},
      conditional: null,
      order: 8
    },
    {
      id: uuidv4(),
      type: QuestionType.NUMERIC,
      title: "Rate your problem-solving skills from 1-10",
      required: true,
      options: [],
      validation: { min: 1, max: 10 },
      conditional: null,
      order: 9
    },
    {
      id: uuidv4(),
      type: QuestionType.SHORT_TEXT,
      title: "What is your preferred work environment?",
      required: true,
      options: [],
      validation: { minLength: 5, maxLength: 200 },
      conditional: null,
      order: 10
    },
    {
      id: uuidv4(),
      type: QuestionType.FILE_UPLOAD,
      title: "Please upload your resume (PDF, DOC, or DOCX)",
      required: true,
      options: [],
      validation: {},
      conditional: null,
      order: 11
    }
  ]
}

function createProductManagerQuestions() {
  return [
    {
      id: uuidv4(),
      type: QuestionType.SINGLE_CHOICE,
      title: "How many years of product management experience do you have?",
      required: true,
      options: ["0-1 years", "2-3 years", "4-6 years", "7-10 years", "10+ years"],
      validation: {},
      conditional: null,
      order: 0
    },
    {
      id: uuidv4(),
      type: QuestionType.MULTI_CHOICE,
      title: "Which product management methodologies are you familiar with?",
      required: true,
      options: ["Agile", "Scrum", "Kanban", "Lean", "Design Thinking", "Jobs-to-be-Done", "OKRs", "User Story Mapping"],
      validation: {},
      conditional: null,
      order: 1
    },
    {
      id: uuidv4(),
      type: QuestionType.SHORT_TEXT,
      title: "What is your experience with user research?",
      required: true,
      options: [],
      validation: { minLength: 10, maxLength: 300 },
      conditional: null,
      order: 2
    },
    {
      id: uuidv4(),
      type: QuestionType.LONG_TEXT,
      title: "Describe a product you successfully launched from concept to market",
      required: true,
      options: [],
      validation: { minLength: 100, maxLength: 1000 },
      conditional: null,
      order: 3
    },
    {
      id: uuidv4(),
      type: QuestionType.SINGLE_CHOICE,
      title: "How do you prioritize features for a product roadmap?",
      required: true,
      options: ["RICE scoring", "MoSCoW method", "Value vs Effort matrix", "Kano model", "Custom approach"],
      validation: {},
      conditional: null,
      order: 4
    },
    {
      id: uuidv4(),
      type: QuestionType.LONG_TEXT,
      title: "Explain your approach to stakeholder management",
      required: true,
      options: [],
      validation: { minLength: 50, maxLength: 500 },
      conditional: null,
      order: 5
    },
    {
      id: uuidv4(),
      type: QuestionType.NUMERIC,
      title: "Rate your analytical skills from 1-10",
      required: true,
      options: [],
      validation: { min: 1, max: 10 },
      conditional: null,
      order: 6
    },
    {
      id: uuidv4(),
      type: QuestionType.SINGLE_CHOICE,
      title: "Do you have experience with data analysis tools?",
      required: true,
      options: ["Yes, extensively", "Yes, some experience", "No, but I'm willing to learn", "No"],
      validation: {},
      conditional: null,
      order: 7
    },
    {
      id: uuidv4(),
      type: QuestionType.MULTI_CHOICE,
      title: "Which tools have you used for product management?",
      required: false,
      options: ["Jira", "Confluence", "Figma", "Miro", "Aha!", "Productboard", "Notion", "Slack", "Microsoft Teams"],
      validation: {},
      conditional: null,
      order: 8
    },
    {
      id: uuidv4(),
      type: QuestionType.LONG_TEXT,
      title: "How do you handle conflicting requirements from different stakeholders?",
      required: true,
      options: [],
      validation: { minLength: 50, maxLength: 400 },
      conditional: null,
      order: 9
    },
    {
      id: uuidv4(),
      type: QuestionType.SHORT_TEXT,
      title: "What metrics do you use to measure product success?",
      required: true,
      options: [],
      validation: { minLength: 20, maxLength: 200 },
      conditional: null,
      order: 10
    },
    {
      id: uuidv4(),
      type: QuestionType.FILE_UPLOAD,
      title: "Please upload your portfolio or case studies",
      required: false,
      options: [],
      validation: {},
      conditional: null,
      order: 11
    }
  ]
}

function createUXDesignerQuestions() {
  return [
    {
      id: uuidv4(),
      type: QuestionType.SINGLE_CHOICE,
      title: "How many years of UX/UI design experience do you have?",
      required: true,
      options: ["0-1 years", "2-3 years", "4-6 years", "7-10 years", "10+ years"],
      validation: {},
      conditional: null,
      order: 0
    },
    {
      id: uuidv4(),
      type: QuestionType.MULTI_CHOICE,
      title: "Which design tools are you proficient in?",
      required: true,
      options: ["Figma", "Sketch", "Adobe XD", "InVision", "Principle", "Framer", "Webflow", "Photoshop", "Illustrator"],
      validation: {},
      conditional: null,
      order: 1
    },
    {
      id: uuidv4(),
      type: QuestionType.SHORT_TEXT,
      title: "What is your design process?",
      required: true,
      options: [],
      validation: { minLength: 20, maxLength: 300 },
      conditional: null,
      order: 2
    },
    {
      id: uuidv4(),
      type: QuestionType.LONG_TEXT,
      title: "Describe a design challenge you faced and how you solved it",
      required: true,
      options: [],
      validation: { minLength: 100, maxLength: 800 },
      conditional: null,
      order: 3
    },
    {
      id: uuidv4(),
      type: QuestionType.SINGLE_CHOICE,
      title: "Do you have experience with user research?",
      required: true,
      options: ["Yes, extensively", "Yes, some experience", "No, but I'm willing to learn", "No"],
      validation: {},
      conditional: null,
      order: 4
    },
    {
      id: uuidv4(),
      type: QuestionType.LONG_TEXT,
      title: "Describe your experience with user research methods",
      required: false,
      options: [],
      validation: { minLength: 30, maxLength: 400 },
      conditional: {
        dependsOn: "user-research-experience",
        condition: ConditionalType.NOT_EQUALS,
        value: "No"
      },
      order: 5
    },
    {
      id: uuidv4(),
      type: QuestionType.MULTI_CHOICE,
      title: "Which user research methods have you used?",
      required: false,
      options: ["User Interviews", "Surveys", "Usability Testing", "A/B Testing", "Card Sorting", "Tree Testing", "Eye Tracking", "Focus Groups"],
      validation: {},
      conditional: {
        dependsOn: "user-research-experience",
        condition: ConditionalType.NOT_EQUALS,
        value: "No"
      },
      order: 6
    },
    {
      id: uuidv4(),
      type: QuestionType.SINGLE_CHOICE,
      title: "Are you familiar with accessibility guidelines?",
      required: true,
      options: ["Yes, WCAG 2.1", "Yes, some knowledge", "No, but I'm willing to learn", "No"],
      validation: {},
      conditional: null,
      order: 7
    },
    {
      id: uuidv4(),
      type: QuestionType.NUMERIC,
      title: "Rate your prototyping skills from 1-10",
      required: true,
      options: [],
      validation: { min: 1, max: 10 },
      conditional: null,
      order: 8
    },
    {
      id: uuidv4(),
      type: QuestionType.SHORT_TEXT,
      title: "What is your approach to design systems?",
      required: true,
      options: [],
      validation: { minLength: 20, maxLength: 200 },
      conditional: null,
      order: 9
    },
    {
      id: uuidv4(),
      type: QuestionType.LONG_TEXT,
      title: "How do you collaborate with developers and product managers?",
      required: true,
      options: [],
      validation: { minLength: 50, maxLength: 400 },
      conditional: null,
      order: 10
    },
    {
      id: uuidv4(),
      type: QuestionType.FILE_UPLOAD,
      title: "Please upload your design portfolio",
      required: true,
      options: [],
      validation: {},
      conditional: null,
      order: 11
    }
  ]
}

async function createAssessments(jobs: any[]) {
  const assessments = [
    {
      jobId: jobs[0].id,
      id: jobs[0].id,
      title: "Senior React Developer Assessment",
      description: "Comprehensive technical assessment for Senior React Developer position",
      sections: [
        {
          id: uuidv4(),
          title: "Technical Skills",
          description: "Evaluate technical expertise and experience",
          questions: createAssessmentQuestions(),
          order: 0
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      jobId: jobs[1].id,
      id: jobs[1].id,
      title: "Product Manager Assessment",
      description: "Assessment to evaluate product management skills and experience",
      sections: [
        {
          id: uuidv4(),
          title: "Product Management Experience",
          description: "Questions about your product management background",
          questions: createProductManagerQuestions(),
          order: 0
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      jobId: jobs[2].id,
      id: jobs[2].id,
      title: "UX Designer Assessment",
      description: "Comprehensive UX/UI design assessment",
      sections: [
        {
          id: uuidv4(),
          title: "Design Experience & Skills",
          description: "Evaluate design skills and experience",
          questions: createUXDesignerQuestions(),
          order: 0
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  for (const assessment of assessments) {
    await db.assessments.put(assessment)
  }

  return assessments
}

export async function seedDatabase() {
  try {
    await db.open()
    
    const jobCount = await db.jobs.count()
    const candidateCount = await db.candidates.count()
    const assessmentCount = await db.assessments.count()
    
    if (jobCount > 0 && candidateCount > 0 && assessmentCount > 0) {
      console.log("Database already seeded")
      return
    }
    
    if (jobCount > 0 || candidateCount > 0 || assessmentCount > 0) {
      console.log("Clearing partially seeded database")
      await db.delete()
      await db.open()
    }
    
    console.log("Starting database seeding...")
    const jobs = await createJobs()
    await createCandidates(jobs)
    await createAssessments(jobs)
    console.log("Database seeding completed")
    
  } catch (error) {
    console.error("Error seeding database:", error)
    
    // Try to recover by clearing and re-creating the database
    try {
      console.log("Attempting database recovery...")
      await db.delete()
      await db.open()
      const jobs = await createJobs()
      await createCandidates(jobs)
      await createAssessments(jobs)
      console.log("Database recovery successful")
    } catch (recoveryError) {
      console.error("Database recovery failed:", recoveryError)
      throw recoveryError
    }
  }
}