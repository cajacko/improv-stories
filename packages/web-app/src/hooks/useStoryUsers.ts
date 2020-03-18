import { useQuery, useMutation, useSubscription } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import getFetchStatus from "../utils/getFetchStatus";

interface ApiStoryUser {
  dateModified: number;
  users: string[];
  storyId: string;
}

function useStoryUsers(storyId: string) {
  const query = useQuery<{ storyUsers: null | ApiStoryUser }>(
    gql`
      query StoryUsers($storyId: ID!) {
        storyUsers(storyId: $storyId) {
          users
          storyId
          dateModified
        }
      }
    `,
    {
      variables: { storyId },
      fetchPolicy: "cache-and-network"
    }
  );

  const [addStoryUser, addStoryUserMutation] = useMutation<
    { addStoryUser: ApiStoryUser },
    { userId: string; storyId: string }
  >(gql`
    mutation AddStoryUser($storyId: ID!, $userId: ID!) {
      addStoryUser(storyId: $storyId, userId: $userId) {
        users
        storyId
        dateModified
      }
    }
  `);

  const [removeStoryUser, removeStoryUserMutation] = useMutation<
    { removeStoryUser: ApiStoryUser },
    { userId: string; storyId: string }
  >(gql`
    mutation RemoveStoryUser($storyId: ID!, $userId: ID!) {
      removeStoryUser(storyId: $storyId, userId: $userId) {
        users
        storyId
        dateModified
      }
    }
  `);

  const subscription = useSubscription<{
    storyUsers: ApiStoryUser;
  }>(
    gql`
      subscription StoryUsers($storyId: ID!) {
        storyUsers(storyId: $storyId) {
          users
          storyId
          dateModified
        }
      }
    `,
    { variables: { storyId } }
  );

  let storyUsers: ApiStoryUser | null = null;

  if (query.data && query.data.storyUsers) storyUsers = query.data.storyUsers;

  if (addStoryUserMutation.data && addStoryUserMutation.data.addStoryUser) {
    if (
      !storyUsers ||
      storyUsers.dateModified <
        addStoryUserMutation.data.addStoryUser.dateModified
    ) {
      storyUsers = addStoryUserMutation.data.addStoryUser;
    }
  }

  if (
    removeStoryUserMutation.data &&
    removeStoryUserMutation.data.removeStoryUser
  ) {
    if (
      !storyUsers ||
      storyUsers.dateModified <
        removeStoryUserMutation.data.removeStoryUser.dateModified
    ) {
      storyUsers = removeStoryUserMutation.data.removeStoryUser;
    }
  }

  if (subscription.data && subscription.data.storyUsers) {
    if (
      !storyUsers ||
      storyUsers.dateModified < subscription.data.storyUsers.dateModified
    ) {
      storyUsers = subscription.data.storyUsers;
    }
  }

  return {
    storyUsers,
    addStoryUser,
    removeStoryUser,
    queryStatus: getFetchStatus(query),
    addStoryUserStatus: getFetchStatus(addStoryUserMutation),
    removeStoryUserStatus: getFetchStatus(removeStoryUserMutation),
    subscriptionStatus: getFetchStatus(subscription)
  };
}

export default useStoryUsers;
