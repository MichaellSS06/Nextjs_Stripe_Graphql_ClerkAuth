import { HttpLink } from "@apollo/client";
import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: "/api/graphql",
  }),
  cache: new InMemoryCache(),
});

export default client;
