import { makeExecutableSchema } from 'graphql-tools';
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";
import { IExecutableSchemaDefinition } from "graphql-tools/dist/Interfaces";
import { GraphQLSchema } from "graphql";

export const schema: GraphQLSchema = makeExecutableSchema(<IExecutableSchemaDefinition>{
  typeDefs,
  resolvers,
});