// Minimal GraphQL client: one function, no library. A GraphQL request is
// just a POST with { query, variables } - see backend/README.md.
const ENDPOINT = import.meta.env.VITE_GRAPHQL_URL;

export async function gql(query, variables = {}) {
  const token = localStorage.getItem('token');

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Network error: ${res.status}`);
  }

  const { data, errors } = await res.json();
  if (errors?.length) {
    // Surface the first GraphQL error with a plain message the UI can show.
    throw new Error(errors[0].message);
  }
  return data;
}
