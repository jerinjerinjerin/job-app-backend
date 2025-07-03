export const resumeTypeDefs = `
scalar Upload

input EducationEntryInput {
  institution: String!
  degree: String!
  fieldOfStudy: String!
  startDate: String!
  endDate: String
  grade: String
  description: String
}

input ExperienceEntryInput {
  company: String!
  position: String!
  startDate: String!
  endDate: String
  responsibilities: [String!]!
  location: String
  description: String
}

input CertificationEntryInput {
  title: String!
  issuer: String!
  issueDate: String!
  expiryDate: String
  credentialUrl: String
}

input CreateResumeInput {
  userId: String!
  title: String!
  summary: String
  skills: [String!]!
  education: [EducationEntryInput!]
  experience: [ExperienceEntryInput!]
  certifications: [CertificationEntryInput!]
  profilePic: Upload
}

type Resume {
  id: ID!
  title: String!
  skills: [String!]!
  resumeUrl: String
  profilePic: String
}

type Mutation {
  createResume(args: CreateResumeInput!): Resume!
}

`;
