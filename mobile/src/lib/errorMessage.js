// Apollo wraps errors; pull out the readable GraphQL message when present.
export function errorMessage(err) {
  return err?.graphQLErrors?.[0]?.message || err?.message || 'Something went wrong.';
}
