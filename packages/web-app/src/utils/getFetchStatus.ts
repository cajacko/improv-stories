function getFetchStatus(query: any) {
  let fetchStatus:
    | { type: "INIT" }
    | { type: "LOADING" }
    | { type: "SUCCESS" }
    | { type: "ERROR"; error: Error } = { type: "INIT" };

  if (query.loading) {
    fetchStatus = { type: "LOADING" };
  } else if (query.error) {
    fetchStatus = { type: "ERROR", error: query.error };
  } else if (query.data) {
    fetchStatus = { type: "SUCCESS" };
  } else {
    fetchStatus = { type: "INIT" };
  }

  return fetchStatus;
}

export default getFetchStatus;
