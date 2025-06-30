export const jobTypeDefs = `
scalar Upload

enum JobType {
  FULL_TIME
  PART_TIME
  CONTRACT
  INTERNSHIP
  FREELANCE
  REMOTE
}

enum JobStatus {
  OPEN
  CLOSED
}

type Job {
  id: ID!
  title: String!
  description: String
  companyId: ID!
  createdById: ID!
  type: JobType!
  experienceMin: Int!
  experienceMax: Int!
  location: String!
  isRemote: Boolean!
  salaryMin: Int!
  salaryMax: Int!
  skills: [String!]!
  applyUrl: String
  expiryJob: String!
  status: JobStatus!
  images: [String!]!
}

type CreateJobResponse {
  success: Boolean!
  message: String!
  data: Job
}

input CreateJobInput {
  title: String!
  description: String
  companyId: ID!
  createdById: ID!
  type: JobType!
  experienceMin: Int!
  experienceMax: Int!
  location: String!
  isRemote: Boolean!
  salaryMin: Int!
  salaryMax: Int!
  skills: [String!]!
  applyUrl: String
  expiryJob: String!
  status: JobStatus!
  images: [Upload!]!
}

type Mutation {
  createJob(args: CreateJobInput!): CreateJobResponse!
}

`;
