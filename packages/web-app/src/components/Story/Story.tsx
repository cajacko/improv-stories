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
import StoryLayout, { RenderProps } from "./StoryLayout";
import getZIndex from "../../utils/getZIndex";
import StoryProgressBar from "./StoryProgressBar";

const useStyles = makeStyles(() =>
  createStyles({
    actionBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: getZIndex("STORY_ACTION_BAR"),
    },
    textContainer: {
      paddingTop: actionBarHeight,
      paddingBottom: "100vh",
      position: "relative",
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
    storyProgressBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: getZIndex("STORY_PROGRESS_BAR_HEADER"),
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
  isTextAreaFocussed,
  focusOnTextArea,
  textAreaRef,
  textAreaValue,
  onTextAreaBlur,
  onTextAreaFocus,
  onTextAreaChange,
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
        canCurrentUserEdit={canCurrentUserEdit}
        renderMainContent={React.useCallback(
          ({ isOpen, toggleIsOpen, isWideScreen }: RenderProps) => (
            <>
              <div className={classes.contentContainer}>
                <div className={classes.content}>
                  <div className={classes.actionBar}>
                    {!isWideScreen &&
                      secondsLeft !== null &&
                      isTextAreaFocussed && (
                        <div className={classes.storyProgressBar}>
                          <StoryProgressBar
                            value={secondsLeft}
                            color="secondary"
                          />
                        </div>
                      )}

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
                      textAreaRef={textAreaRef}
                      textAreaValue={textAreaValue}
                      onTextAreaBlur={onTextAreaBlur}
                      onTextAreaFocus={onTextAreaFocus}
                      onTextAreaChange={onTextAreaChange}
                      canCurrentUserEdit={canCurrentUserEdit}
                    />
                  </div>
                </div>
              </div>
              <StoryStatus
                isEditingSessionActive={!!editingSession}
                secondsLeft={secondsLeft}
                canCurrentUserEdit={canCurrentUserEdit}
                editingUser={editingUser}
              />
            </>
          ),
          [
            classes,
            storyId,
            isTextAreaFocussed,
            canCurrentUserEdit,
            editingSession,
            textAreaRef,
            textAreaValue,
            onTextAreaBlur,
            onTextAreaFocus,
            onTextAreaChange,
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
