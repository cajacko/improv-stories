import React from "react";
import useUser from "../hooks/useUser";

function User({ userId }: { userId: string }) {
  const { user } = useUser(userId);

  return <div>{user ? user.name : userId}</div>;
}

export default User;
