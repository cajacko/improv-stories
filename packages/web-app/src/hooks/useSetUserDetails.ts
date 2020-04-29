import React from "react";
import { v4 as uuid } from "uuid";
import { useSelector } from "react-redux";
import { CurrentUserState } from "../store/currentUser/types";
import { send } from "../utils/socket";
import selectors from "../store/selectors";

function useSetUserDetails(): CurrentUserState {
  const userDetails = useSelector(selectors.currentUser.selectCurrentUser);

  React.useEffect(() => {
    const interval = setInterval(() => {
      try {
        send({
          id: uuid(),
          createdAt: new Date().toISOString(),
          type: "SET_USER_DETAILS",
          payload: { userDetails },
        });

        clearInterval(interval);
      } catch {}
    }, 500);
  }, [userDetails]);

  return userDetails;
}

export default useSetUserDetails;
