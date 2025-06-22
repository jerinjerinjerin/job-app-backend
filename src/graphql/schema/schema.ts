import { makeExecutableSchema } from '@graphql-tools/schema';
import { authTypeDefs } from '../../identity/schema/identitySchema';
import { authResolvers } from '../../identity/resolver/identityResolver';

export const rootSchema = makeExecutableSchema({
  typeDefs: authTypeDefs,
  resolvers: {
    Mutation: authResolvers.Mutation,
  },
});
