import { useSelector } from "react-redux";
import { User } from "../sharedTypes";

function useStoryUsers(storyId: string) {
  const story = useSelector((state) => state.storiesById[storyId]);

  const users = useSelector((state) => {
    if (!story) return [];

    const users: User[] = [];

    story.onlineUserIds.forEach((userId) => {
      const user = state.usersById[userId];

      // TODO: If current user then get the details from current user instead
      // Turn this into a selector so we always do this if we get a user

      if (!user) return;

      users.push(user);
    });

    return users;
  });

  return users;
}

export default useStoryUsers;
