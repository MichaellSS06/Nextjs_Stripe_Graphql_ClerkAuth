import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { PubSub } from "graphql-subscriptions";
import { User }  from "../../../types/graphql"

// --- PubSub en memoria para simular suscripciones
type Message = {
  id: string;
  text: any;
  user: User;
};
type Events = Record<string, unknown> & {
  [K in typeof MESSAGE_ADDED]: { messageAdded: Message };
};

const pubsub = new PubSub<Events>();

const MESSAGE_ADDED = "MESSAGE_ADDED";

// --- TypeDefs
const typeDefs = `#graphql
  enum Role {
    ADMIN
    USER
    GUEST
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
  }

  type Message {
    id: ID!
    text: String!
    user: User!
  }

  type Query {
    # Simula DB PostgreSQL
    users: [User!]!

    # Simula REST API
    posts: [Post!]!

    # Query compuesta
    feed: [Post!]!
  }

  type Mutation {
    addUser(name: String!, email: String!, role: Role!): User!
    addPost(title: String!, content: String!, authorId: ID!): Post!
    sendMessage(text: String!, userId: ID!): Message!
  }

  type Subscription {
    messageAdded: Message!
  }
`;

// --- Mock DB (como PostgreSQL)
const usersDB = [
  { id: "1", name: "Michaell", email: "micha@test.com", role: "ADMIN" },
  { id: "2", name: "Ana", email: "ana@test.com", role: "USER" },
];

// --- Mock REST API (posts)
const postsAPI = [
  { id: "101", title: "Primer post", content: "Hola mundo", authorId: "1" },
  { id: "102", title: "Segundo post", content: "Next.js + GraphQL", authorId: "2" },
];

// --- Mock messages para suscripciones
let messages: any[] = [];

// --- Resolvers
const resolvers = {
  Query: {
    users: () => usersDB,
    posts: () =>
      postsAPI.map((p) => ({
        ...p,
        author: usersDB.find((u) => u.id === p.authorId),
      })),
    feed: () =>
      postsAPI.map((p) => ({
        ...p,
        author: usersDB.find((u) => u.id === p.authorId),
      })),
  },

  Mutation: {
    addUser: (_: any, { name, email, role }: any) => {
      const newUser = { id: String(usersDB.length + 1), name, email, role };
      usersDB.push(newUser);
      return newUser;
    },
    addPost: (_: any, { title, content, authorId }: any) => {
      const newPost = { id: String(postsAPI.length + 101), title, content, authorId };
      postsAPI.push(newPost);
      return { ...newPost, author: usersDB.find((u) => u.id === authorId) };
    },
    sendMessage: (_: any, { text, userId }: any) => {
      const user = usersDB.find((u) => u.id === userId);
      if (!user) {throw new Error("Usuario no encontrado");}
      const newMessage = { id: String(messages.length + 1), text, user };
      messages.push(newMessage);
      pubsub.publish(MESSAGE_ADDED, { messageAdded: newMessage });
      return newMessage;
    },
  },

  Subscription: {
    messageAdded: {
      subscribe: () => (pubsub as any).asyncIterator([MESSAGE_ADDED]) as AsyncIterableIterator<{
          messageAdded: Message;
        }>,
      resolve: (payload: { messageAdded: Message }) => payload.messageAdded,
    },
  },
};

// --- Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// // --- Export handlers para Next.js (GET/POST)
// export const { GET, POST } = startServerAndCreateNextHandler(server);

const handler = startServerAndCreateNextHandler(server);

// Next.js App Router necesita exportar funciones GET/POST:
export async function POST(request: Request) {
  return handler(request);
}

export async function GET(request: Request) {
  return handler(request);
}