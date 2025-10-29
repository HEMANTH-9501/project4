// Job types
export const JobStatus = {
  ACTIVE: "active",
  ARCHIVED: "archived",
}

// Candidate stages
export const CandidateStage = {
  APPLIED: "applied",
  SCREEN: "screen",
  TECH: "tech",
  OFFER: "offer",
  HIRED: "hired",
  REJECTED: "rejected",
}

// Question types
export const QuestionType = {
  SHORT_TEXT: "short_text",
  LONG_TEXT: "long_text",
  SINGLE_CHOICE: "single_choice",
  MULTI_CHOICE: "multi_choice",
  NUMERIC: "numeric",
  FILE_UPLOAD: "file_upload",
}

// Validation types
export const ValidationType = {
  REQUIRED: "required",
  MIN_LENGTH: "minLength",
  MAX_LENGTH: "maxLength",
  MIN_VALUE: "min",
  MAX_VALUE: "max",
  PATTERN: "pattern",
}

// Conditional logic types
export const ConditionalType = {
  EQUALS: "equals",
  NOT_EQUALS: "not_equals",
  CONTAINS: "contains",
  GREATER_THAN: "greater_than",
  LESS_THAN: "less_than",
  IS_EMPTY: "is_empty",
  IS_NOT_EMPTY: "is_not_empty",
}

// Assessment response status
export const ResponseStatus = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
}
