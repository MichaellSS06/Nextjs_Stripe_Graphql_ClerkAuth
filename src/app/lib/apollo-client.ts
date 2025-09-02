import { HttpLink, split, ApolloLink } from "@apollo/client";
import { ApolloClient, InMemoryCache } from "@apollo/client";
// import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
// import { createClient } from "graphql-ws";
// import { getMainDefinition } from "@apollo/client/utilities";

const httpLink = new HttpLink({
  uri: "api/graphql",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;

// const wsLink = new GraphQLWsLink(
//   createClient({
//     url: "ws://localhost:4000/graphql/subscriptions",
//   })
// )as unknown as ApolloLink ;

// const splitLink = split(
//   ({ query }) => {
//     const def = getMainDefinition(query);
//     return (
//       def.kind === "OperationDefinition" &&
//       def.operation === "subscription"
//     );
//   },
//   wsLink,
//   httpLink
// );

