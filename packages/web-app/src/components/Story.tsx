import React from "react";
import useAddCurrentUserToStory from "../hooks/useAddCurrentUserToStory";
import withLiveStoryEditor, {
  InjectedLiveStoryEditorProps,
} from "../hoc/withLiveStoryEditor";
import useStoryUsers from "../hooks/useStoryUsers";
import useStoryHistory from "../hooks/useStoryHistory";
import useSetUserDetails from "../hooks/useSetUserDetails";
import ToolBar from "./ToolBar";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex: 1;
  overflow: auto;
  flex-direction: column;
`;

interface OwnProps {
  storyId: string;
}

interface Props extends OwnProps, InjectedLiveStoryEditorProps {}

function Story({
  storyId,
  currentUserCanEdit,
  currentlyEditingUser,
  text,
  onTextChange,
  countDownTimer,
}: Props) {
  useSetUserDetails();
  // TODO: this needs to constantly request user names from onlineIds with no name
  // useGetUsers(storyId);
  useAddCurrentUserToStory(storyId);
  const users = useStoryUsers(storyId);
  const entries = useStoryHistory(storyId);

  return (
    <>
      <ToolBar storyId={storyId} />
      <Container>
        <div>
          {entries.map((entry) => (
            <p key={entry.id}>{entry.finalText}</p>
          ))}
        </div>
        <p>
          {currentUserCanEdit
            ? "Edit!"
            : currentlyEditingUser
            ? `${currentlyEditingUser.name} is editing`
            : "No one editing"}
        </p>
        {users && (
          <ul>
            {users.map(({ id, name }) => (
              <li key={id}>{name || "Anonymous"}</li>
            ))}
          </ul>
        )}
        <textarea
          value={text}
          onChange={onTextChange}
          disabled={!currentUserCanEdit}
        >
          {text}
        </textarea>
        {countDownTimer !== null && <p>Time Left: {countDownTimer}</p>}
      </Container>
    </>
  );
}

export default withLiveStoryEditor<OwnProps>(Story);
