import { makeExecutableSchema } from "@graphql-tools/schema";

import { companyTypeDefs } from "../../agent/company/companySchema";
import { companyResolvers } from "../../agent/company/compnyResolvers";
import { authResolvers } from "../../identity/resolver/identityResolver";
import { authTypeDefs } from "../../identity/schema/identitySchema";

export const rootSchema = makeExecutableSchema({
  typeDefs: [authTypeDefs, companyTypeDefs],
  resolvers: [authResolvers, companyResolvers],
});
