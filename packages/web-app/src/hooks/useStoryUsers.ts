import { useSelector } from "react-redux";
import { User } from "../sharedTypes";
import selectors from "../store/selectors";

function useStoryUsers(storyId: string) {
  const story = useSelector((state) => state.storiesById[storyId]);

  const users = useSelector((state) => {
    if (!story) return [];

    const users: User[] = [];

    story.activeUserIds.forEach((userId) => {
      const user = selectors.usersById.selectUserById(state, userId);

      if (!user) return;

      users.push(user);
    });

    return users;
  });

  return users;
}

export default useStoryUsers;
