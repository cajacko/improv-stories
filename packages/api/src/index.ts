import { ApolloServer, gql, PubSub } from "apollo-server";

const kill = require("kill-port");

const pubsub = new PubSub();

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  type Subscription {
    bookAdded: Book
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
  }
`;

const books = [
  {
    title: "Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling"
  },
  {
    title: "Jurassic Park",
    author: "Michael Crichton"
  }
];

const BOOK_ADDED = "BOOK_ADDED";

setInterval(() => {
  console.log("publish");

  pubsub.publish(BOOK_ADDED, {
    bookAdded: {
      title: "Hello",
      author: "Oh my"
    }
  });
}, 1000);

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Subscription: {
    bookAdded: {
      // Additional event labels can be passed to asyncIterator creation
      subscribe: () => pubsub.asyncIterator([BOOK_ADDED])
    }
  },
  Query: {
    books: () => books
  }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

const PORT = 4000;

kill(PORT, "tcp")
  .catch(() => {})
  .then(() =>
    server.listen({
      host: "localhost",
      port: PORT
    })
  )
  .then(({ url }) => {
    console.log(`🚀  Server ready at  ${url}`);
  });
