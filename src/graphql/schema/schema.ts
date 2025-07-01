import { makeExecutableSchema } from "@graphql-tools/schema";

import { companyTypeDefs } from "../../modules/agent/company/companySchema";
import { companyResolvers } from "../../modules/agent/company/compnyResolvers";
import { jobResolvers } from "../../modules/agent/job/resolvers";
import { jobTypeDefs } from "../../modules/agent/job/schema";
import { authResolvers } from "../../modules/identity/resolver/identityResolver";
import { authTypeDefs } from "../../modules/identity/schema/identitySchema";
import { applicationResolver } from "../../modules/user/application/resolvers";
import { applicationTypeDefs } from "../../modules/user/application/schema";

export const rootSchema = makeExecutableSchema({
  typeDefs: [authTypeDefs, companyTypeDefs, jobTypeDefs, applicationTypeDefs],
  resolvers: [
    authResolvers,
    companyResolvers,
    jobResolvers,
    applicationResolver,
  ],
});
