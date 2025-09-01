"use client"
import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { ApolloProvider, useQuery, useMutation } from "@apollo/client/react";
import client from "../lib/apollo-client";
import { FeedData } from "@/types/graphql";

// --- Fragmento para reutilizar campos de User
const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    name
    email
    role
  }
`;

const GET_FEED = gql`
  query {
    feed {
      id
      title
      content
      author {
        ...UserFields
      }
    }
  }
  ${USER_FRAGMENT}
`;

const ADD_USER = gql`
  mutation AddUser($name: String!, $email: String!, $role: Role!) {
    addUser(name: $name, email: $email, role: $role) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

function Feed() {
  const { data, loading } = useQuery<FeedData>(GET_FEED);
  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <h2 className="font-bold text-xl">Feed de Posts</h2>
      {data?.feed.map((p: any) => (
        <div key={p.id} className="border p-2 m-2 rounded">
          <h3>{p.title}</h3>
          <p>{p.content}</p>
          <small>By {p.author.name} ({p.author.role})</small>
        </div>
      ))}
    </div>
  );
}

function AddUserForm() {
  const [addUser] = useMutation(ADD_USER);

  const handleClick = () => {
    addUser({ variables: { name: "Nuevo", email: "nuevo@test.com", role: "GUEST" } });
  };

  return <button onClick={handleClick} className="bg-blue-500 text-white p-2">Añadir Usuario</button>;
}

export default function HomePage() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/")
      .then(res => res.json())
      .then(data => setMsg(data.message));
  }, []);

  return (
    <div>
      <h1>{msg}</h1>
      <ApolloProvider client={client}>
        <h1 className="text-2xl font-bold">Next.js + GraphQL Completo</h1>
        <AddUserForm />
        <Feed />
      </ApolloProvider>
    </div>
  )
}
