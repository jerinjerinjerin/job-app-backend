export const applicationTypeDefs = `
  scalar Upload

  enum ApplicationStatus {
    PENDING
    REVIEWED
    INTERVIEW
    OFFERED
    REJECTED
    ACCEPTED
  }

  type Application {
    id: ID!
    userId: String!
    jobId: String!
    resumeUrl: String!
    coverNote: String
    status: ApplicationStatus!
    createdAt: String!
    job: Job!
    user: User!
  }

  input CreateApplicationInput {
    userId: String!
    jobId: String!
    resumeUrl: Upload!    
    coverNote: String
  }

  type CreateApplicationPayload {
    success: Boolean!
    message: String!
    data: Application
  }

  type Mutation {
    createApplication(args: CreateApplicationInput!): CreateApplicationPayload!
  }
`;
