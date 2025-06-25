import { makeExecutableSchema } from "@graphql-tools/schema";

import { authResolvers } from "../../identity/resolver/identityResolver";
import { authTypeDefs } from "../../identity/schema/identitySchema";

export const rootSchema = makeExecutableSchema({
  typeDefs: authTypeDefs,
  resolvers: authResolvers,
});
