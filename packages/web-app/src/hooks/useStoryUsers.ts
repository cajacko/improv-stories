import { useSubscription } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { User } from "../store/currentUser/types";

function useStoryUsers() {
  // useQuery()

  const { data } = useSubscription<{
    storyUsersChanged: User[];
  }>(gql`
    subscription test {
      storyUsersChanged {
        name
        userId
      }
    }
  `);

  const storyUsers = data && data.storyUsersChanged;

  return storyUsers;
}

export default useStoryUsers;
