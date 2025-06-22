export const authTypeDefs = `
  type User {
    id: String!
    email: String!
    name: String!
    provider: String!
    role: String!
    otp: String
    isValidUser: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
  }

  input SignupInput {
    email: String!
    password: String!
    name: String!
    role: String
    otp: String
  }

  type OtpVerificationResponse {
  success: Boolean!
  message: String!
}

input OtpInput {
  email: String!
  otp: String!
}

  input LoginInput {
    email: String!
    password: String!
  }

  input GoogleLoginInput {
    token: String!
  }

  type Query {
    _empty: String
  }

  type Mutation {
    signup(input: SignupInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    verifyOtp(input: OtpInput!): OtpVerificationResponse!
    googleLogin(input: GoogleLoginInput!): AuthPayload!
    refreshToken: AuthPayload!
    logout: Boolean!
  }
`;
