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
    storyUsers(storyId: ID!): StoryUsers!
    user(userId: ID!): User!
  }

  type Query {
    storyUsers(storyId: ID!): StoryUsers!
    user(userId: ID!): User
  }

  type Mutation {
    addStoryUser(storyId: ID!, userId: ID!): StoryUsers!
    removeStoryUser(storyId: ID!, userId: ID!): StoryUsers!
    user(userId: ID!, name: String!): User!
  }
`;

const STORY_USERS = "STORY_USERS";
const USER = "USER";

const resolvers = {
  Subscription: {
    storyUsers: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([STORY_USERS]),
        (payload, { storyId }) => {
          return payload.storyUsers.storyId === storyId;
        }
      )
    },
    user: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([USER]),
        (payload, { userId }) => {
          return payload.user.userId === userId;
        }
      )
    }
  },
  Query: {
    storyUsers: (_, { storyId }) => storyUsers[storyId],
    user: (_, { userId }) => users[userId]
  },
  Mutation: {
    user: (_, { userId, name }) => {
      users[userId] = {
        dateModified: Date.now(),
        userId,
        name
      };

      pubsub.publish(USER, {
        user: users[userId]
      });

      return users[userId];
    },
    addStoryUser: (_, { userId, storyId }) => {
      const dateModified = Date.now();

      if (!storyUsers[storyId]) {
        storyUsers[storyId] = { storyId, dateModified, users: [] };
      }

      storyUsers[storyId].dateModified = dateModified;
      storyUsers[storyId].users.push(userId);

      pubsub.publish(STORY_USERS, {
        storyUsers: storyUsers[storyId]
      });

      return storyUsers[storyId];
    },
    removeStoryUser: (_, { userId, storyId }) => {
      const dateModified = Date.now();

      if (!storyUsers[storyId]) {
        storyUsers[storyId] = { storyId, dateModified, users: [] };
      }

      storyUsers[storyId].dateModified = dateModified;
      storyUsers[storyId].users = storyUsers[storyId].users.filter(
        i => i !== userId
      );

      pubsub.publish(STORY_USERS, {
        storyUsers: storyUsers[storyId]
      });

      return storyUsers[storyId];
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
