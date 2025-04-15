import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers/resolvers.js";

const server = new ApolloServer({ typeDefs, resolvers });

const { url } = startStandaloneServer(server, {
    listen: { port: 4000 }
});

console.log(`Server Started running at: ${url}`);


