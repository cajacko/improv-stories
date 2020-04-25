import { store } from "./index";
import { setUsers } from "./usersById/actions";
import { listen } from "../utils/socket";

listen("BROADCAST_GROUP_USERS", (message) => {
  if (message.type !== "BROADCAST_GROUP_USERS") return;

  store.dispatch(setUsers({ users: message.payload.users }));
});
