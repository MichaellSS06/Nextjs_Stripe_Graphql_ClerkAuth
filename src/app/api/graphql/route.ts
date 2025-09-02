import { ApolloServer } from "@apollo/server";
// import { WebSocketServer } from "ws";
// import { useServer }from "graphql-ws/use/ws";
// import http from "http";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { PubSub } from "graphql-subscriptions";
import { User }  from "../../../types/graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
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
    posts: [PostWithoutUser!]! 
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
  }
  
  type PostWithoutUser {
    id: ID!
    title: String!
    content: String!
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
    updatePost(id: ID!, title: String, content: String): Post!  
    deletePost(id: ID!): Boolean!  
    sendMessage(text: String!, userId: ID!): Message!
  }

  type Subscription {
    messageAdded: Message!
  }
`;

// --- Mock DB (como PostgreSQL)
const usersDB = [
  { id: "1", name: "Michaell", email: "micha@test.com", role: "ADMIN", postsIds: ["101"] },
  { id: "2", name: "Ana", email: "ana@test.com", role: "USER", postsIds: ["102"] },
];

// --- Mock REST API (posts)
let postsAPI = [
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
      const newUser = { id: String(usersDB.length + 1), name, email, role, postsIds: [] };
      usersDB.push(newUser);
      return newUser;
    },
    
    addPost: (_: any, { title, content, authorId }: any) => {
      const newPost = { id: String(postsAPI.length + 101), title, content, authorId };
      postsAPI.push(newPost);
      // Asociamos el post al user
      const user = usersDB.find((u) => u.id === authorId);
      if (user) {
        user.postsIds.push(newPost.id);
      }

      return { ...newPost, author: user };
    },

    updatePost: (_: any, { id, title, content }: any) => {
      const post = postsAPI.find((p) => p.id === id);
      if (!post) throw new Error("Post no encontrado");

      if (title !== undefined) post.title = title;
      if (content !== undefined) post.content = content;

      return { ...post, author: usersDB.find((u) => u.id === post.authorId) };
    },

    deletePost: (_: any, { id }: any) => {
      const index = postsAPI.findIndex((p) => p.id === id);
      if (index === -1) return false;

      const [deletedPost] = postsAPI.splice(index, 1);

      // Removemos del user
      const user = usersDB.find((u) => u.id === deletedPost.authorId);
      if (user) {
        user.postsIds = user.postsIds.filter((pid: string) => pid !== id);
      }

      return true;
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

  User: {
    posts: (parent: any) => {
      return parent.postsIds.map((pid: string) => {
        const post = postsAPI.find((p) => p.id === pid);
        return { ...post, author: parent };
      });
    },
  },
};

// 1. Crear el schema ejecutable
const schema = makeExecutableSchema({ typeDefs, resolvers });

// 2. Crear Apollo Server con el schema
const server = new ApolloServer({
  typeDefs,
  resolvers
});

// // --- Export handlers para Next.js (GET/POST)
// export const { GET, POST } = startServerAndCreateNextHandler(server);
// 3. Handlers para Next.js
const handler = startServerAndCreateNextHandler(server);

// Next.js App Router necesita exportar funciones GET/POST:
export async function POST(request: Request) {
  return handler(request);
}

export async function GET(request: Request) {
  return handler(request);
}


// server.ts
// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   const server = http.createServer((req, res) => handle(req, res));

//   // WebSocket para GraphQL Subscriptions
//   const wsServer = new WebSocketServer({ server, path: "/graphql/subscriptions" });
//   useServer({ schema }, wsServer);

//   server.listen(4000, () => {
//     console.log("🚀 Next.js en http://localhost:4000");
//     console.log("📡 WS listo en ws://localhost:4000/graphql/subscriptions");
//   });
// });



// server.ts
// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   const server = http.createServer((req, res) => handle(req, res));

//   // WebSocket para GraphQL Subscriptions
//   const wsServer = new WebSocketServer({ server, path: "/graphql/subscriptions" });
//   useServer({ schema }, wsServer);

//   server.listen(4000, () => {
//     console.log("🚀 Next.js en http://localhost:4000");
//     console.log("📡 WS listo en ws://localhost:4000/graphql/subscriptions");
//   });
// });