import { useSelector } from "react-redux";
import { User } from "../store/usersById/types";

function useStoryUsers(storyId: string) {
  const story = useSelector((state) => state.storiesById[storyId]);

  const users = useSelector(
    (state) =>
      story &&
      story.onlineUserIds
        .map((userId) => {
          const user = state.usersById[userId];

          if (user) return user;

          return {
            id: userId,
            name: null,
          };
        })
        .filter((user): user is User => !!user)
  );

  return users;
}

export default useStoryUsers;
