import { store } from "./index";
import { setUsers } from "./usersById/actions";
import { listen, getSocketId } from "../utils/socket";

listen("BROADCAST_GROUP_USERS", (message) => {
  if (message.type !== "BROADCAST_GROUP_USERS") return;

  const userId = getSocketId();

  const usersExceptCurrent = message.payload.users.filter(
    ({ id }) => id !== userId
  );

  if (usersExceptCurrent.length <= 0) return;

  store.dispatch(setUsers({ users: usersExceptCurrent }));
});
