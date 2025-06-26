export const companyTypeDefs = `
scalar Upload
scalar DateTime

type Company {
  id: String!
  name: String!
  website: String
  logo: String
  description: String
  phone: String!
  otp: String
  verify: Boolean
  createdById: String
  createdAt: DateTime
  updatedAt: DateTime
}

type CompanyPayload {
  company: Company!
}

input CreateCompanyInput {
  name: String!
  website: String
  description: String
  phone: String!
  userId: String!
  logo: Upload
}

type Mutation {
  createCompany(input: CreateCompanyInput!): CompanyPayload!
}

`;
