import React from "react";
import { v4 as uuid } from "uuid";
import { useSelector } from "react-redux";
import { send } from "../utils/socket";

function useSetUserDetails() {
  const userDetails = useSelector((state) => state.currentUser);

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
}

export default useSetUserDetails;
