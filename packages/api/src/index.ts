import { ApolloServer, gql, PubSub, withFilter } from "apollo-server";

const kill = require("kill-port");

const userIdsBySocket = {};
const socketByUserIds = {};

const pubsub = new PubSub();

const users: {
  [key: string]:
    | undefined
    | { userId: string; name: string; dateModified: number };
} = {};

const storyUsers: {
  [key: string]:
    | undefined
    | { dateModified: number; users: string[]; storyId: string };
} = {};

const typeDefs = gql`
  scalar Timestamp

  type User {
    dateModified: Timestamp!
    userId: ID!
    name: String!
  }

  type StoryUsers {
    dateModified: Timestamp!
    storyId: ID!
    users: [String!]
  }

  type Subscription {
    storyUsersChanged: StoryUsers!
    user(userId: ID!): User!
  }

  type Query {
    storyUsers(storyId: ID!): StoryUsers!
    user(userId: ID!): User
  }

  type Mutation {
    addStoryUser(userId: ID!, storyId: ID!): StoryUsers!
    user(userId: ID!, name: String!): User!
  }
`;

const STORY_USERS_MODIFIED = "STORY_USERS_MODIFIED";
const USER = "USER";

const resolvers = {
  Subscription: {
    // storyUsersChanged: {
    //   subscribe: () => pubsub.asyncIterator([STORY_USERS_MODIFIED])
    // },
    user: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([USER]),
        (payload, { userId }) => {
          return payload.userModified.userId === userId;
        }
      )
    }
  },
  Query: {
    storyUsers: (_, { storyId }) => ({
      dateModified: Date.now(),
      storyId,
      users: storyUsers[storyId]
    }),
    user: (_, { userId }) => {
      return users[userId];
    }
  },
  Mutation: {
    user: (_, { userId, name }) => {
      users[userId] = {
        dateModified: Date.now(),
        userId,
        name
      };

      pubsub.publish(USER, {
        userModified: users[userId]
      });

      return users[userId];
    },
    addStoryUser: (_, { userId, storyId }) => {
      if (!storyUsers[storyId])
        storyUsers[storyId] = { storyId, dateModified: Date.now(), users: [] };

      storyUsers[storyId].users.push(userId);

      pubsub.publish(STORY_USERS_MODIFIED, {
        storyUsersChanged: storyUsers[storyId]
      });

      return {
        success: true
      };
    }
  }
};

function addConnection(userId, socket) {
  userIdsBySocket[socket] = userId;
  socketByUserIds[userId] = socket;
}

function removeConnection(socket) {
  const userId = userIdsBySocket[socket];

  delete userIdsBySocket[socket];
  delete socketByUserIds[userId];
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  subscriptions: {
    onConnect: ({ userId }: { userId: string }, socket, context) => {
      addConnection(userId, socket);
    },
    onDisconnect: socket => {
      removeConnection(socket);
    }
  }
});

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
