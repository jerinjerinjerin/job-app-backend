import { makeExecutableSchema } from "@graphql-tools/schema";

import { companyTypeDefs } from "../../agent/company/companySchema";
import { companyResolvers } from "../../agent/company/compnyResolvers";
import { jobResolvers } from "../../agent/job/resolvers";
import { jobTypeDefs } from "../../agent/job/schema";
import { authResolvers } from "../../identity/resolver/identityResolver";
import { authTypeDefs } from "../../identity/schema/identitySchema";

export const rootSchema = makeExecutableSchema({
  typeDefs: [authTypeDefs, companyTypeDefs, jobTypeDefs],
  resolvers: [authResolvers, companyResolvers, jobResolvers],
});
