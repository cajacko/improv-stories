import React from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import useAddCurrentUserToStory from "../../hooks/useAddCurrentUserToStory";
import withLiveStoryEditor, {
  InjectedLiveStoryEditorProps,
} from "../../hoc/withLiveStoryEditor";
import useSetUserDetails from "../../hooks/useSetUserDetails";
import ToolBar from "../ToolBar";
import ConnectedUsers from "../ConnectedUsers";
import StoryActionBar, { height as actionBarHeight } from "./StoryActionBar";
import StoryFocusOverlay from "./StoryFocusOverlay";
import StoryContent from "./StoryContent";
import StoryStatus from "./StoryStatus";
import StoryLayout from "./StoryLayout";

const useStyles = makeStyles(() =>
  createStyles({
    actionBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
    },
    textContainer: {
      paddingTop: actionBarHeight,
    },
    contentContainer: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
      alignItems: "center",
      overflow: "auto",
    },
    content: {
      maxWidth: 500,
      width: "100%",
      margin: 20,
      padding: "0 20px",
    },
  })
);

interface OwnProps {
  storyId: string;
}

type Props = OwnProps & InjectedLiveStoryEditorProps;

function Story({
  storyId,
  editingSession,
  editingUser,
  secondsLeft,
  canCurrentUserEdit,
  textAreaProps,
  isTextAreaFocussed,
  focusOnTextArea,
}: Props) {
  useSetUserDetails();
  useAddCurrentUserToStory(storyId);
  const classes = useStyles();

  const onFocusOverlayClick = React.useCallback(() => focusOnTextArea(), [
    focusOnTextArea,
  ]);

  return (
    <>
      <ToolBar />
      <StoryLayout
        renderMainContent={React.useCallback(
          ({ isOpen, toggleIsOpen }) => (
            <>
              <div className={classes.contentContainer}>
                <div className={classes.content}>
                  <div className={classes.actionBar}>
                    <StoryActionBar
                      storyId={storyId}
                      isUsersDrawerOpen={isOpen}
                      toggleIsUsersDrawerOpen={toggleIsOpen}
                    />
                  </div>
                  {!isTextAreaFocussed && canCurrentUserEdit && (
                    <StoryFocusOverlay onClick={onFocusOverlayClick} />
                  )}
                  <div className={classes.textContainer}>
                    <StoryContent
                      storyId={storyId}
                      editingSession={editingSession}
                      textAreaProps={textAreaProps}
                      canCurrentUserEdit={canCurrentUserEdit}
                    />
                  </div>
                </div>
              </div>
              <StoryStatus
                isEditingSessionActive={!!editingSession}
                secondsLeft={secondsLeft}
                canCurrentUserEdit={canCurrentUserEdit}
                editingUserName={editingUser && editingUser.name}
              />
            </>
          ),
          [
            classes,
            storyId,
            isTextAreaFocussed,
            canCurrentUserEdit,
            editingSession,
            textAreaProps,
            secondsLeft,
            editingUser,
            onFocusOverlayClick,
          ]
        )}
        renderDrawerContent={React.useCallback(
          ({ handleClose }) => (
            <ConnectedUsers storyId={storyId} handleClose={handleClose} />
          ),
          [storyId]
        )}
      />
    </>
  );
}

export default withLiveStoryEditor<OwnProps>(React.memo(Story));