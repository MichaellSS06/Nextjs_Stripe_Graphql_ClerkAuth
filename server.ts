// server.ts
import next from "next";
import http from "http";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { schema } from "./src/app/api/graphql/route";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => handle(req, res));

  // WebSocket para GraphQL Subscriptions
  const wsServer = new WebSocketServer({ server, path: "/graphql/subscriptions" });
  useServer({ schema }, wsServer);

  server.listen(4000, () => {
    console.log("🚀 Next.js en http://localhost:4000");
    console.log("📡 WS listo en ws://localhost:4000/graphql/subscriptions");
  });
});
