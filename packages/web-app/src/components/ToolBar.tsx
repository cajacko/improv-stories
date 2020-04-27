import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { v4 as uuid } from "uuid";
import actions from "../store/actions";
import useCurrentUserId from "../hooks/useCurrentUserId";
import { send } from "../utils/socket";

function ToolBar({ storyId }: { storyId: string }) {
  const currentUserId = useCurrentUserId();
  const currentUser = useSelector((state) => state.currentUser);
  const dispatch = useDispatch();
  const [value, setValue] = React.useState(currentUser.name);

  const canSave = value && !!value.length && !!currentUserId;

  const onSetValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const saveName = () => {
    if (!canSave || !value || !currentUserId) return;

    dispatch(
      actions.currentUser.setCurrentUserName({
        name: value,
        userId: currentUserId,
        date: new Date().toISOString(),
      })
    );

    send({
      id: uuid(),
      type: "SET_USER_DETAILS",
      createdAt: new Date().toISOString(),
      payload: {
        userDetails: {
          name: value,
        },
      },
    });
  };

  return (
    <div>
      {currentUserId ? (
        <>
          <input
            type="text"
            value={value || ""}
            onChange={onSetValue}
            placeholder="Your name"
          />
          <button onClick={saveName}>Save</button>
        </>
      ) : (
        <p>Waiting...</p>
      )}
    </div>
  );
}

export default ToolBar;
