import { SubscriptionClient } from "subscriptions-transport-ws";
import { WebSocketLink } from "apollo-link-ws";
import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { gql } from "apollo-boost";

const GRAPHQL_ENDPOINT = "ws://localhost:4000/graphql";

const client = new SubscriptionClient(GRAPHQL_ENDPOINT, {
  reconnect: true
});

const link = new WebSocketLink(client);

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

apolloClient
  .query({
    query: gql`
      {
        books {
          title
        }
      }
    `
  })
  .then(console.log)
  .catch(console.warn);

apolloClient
  .subscribe({
    query: gql`
      subscription test {
        bookAdded {
          title
          author
        }
      }
    `
  })
  .subscribe({
    next(data) {
      console.log("data", data);
    }
  });

export default apolloClient;
