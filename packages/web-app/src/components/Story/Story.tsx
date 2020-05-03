import React from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import withLiveStoryEditor, {
  InjectedLiveStoryEditorProps,
} from "../../hoc/withLiveStoryEditor";
import ToolBar from "../ToolBar";
import ConnectedUsers from "../ConnectedUsers";
import StoryActionBar, { height as actionBarHeight } from "./StoryActionBar";
import StoryFocusOverlay from "./StoryFocusOverlay";
import StoryContent from "./StoryContent";
import StoryStatus from "./StoryStatus";
import StoryLayout, { RenderProps } from "./StoryLayout";
import getZIndex from "../../utils/getZIndex";
import StoryProgressBar from "./StoryProgressBar";
import useStorySetup from "./useStorySetup";
import selectors from "../../store/selectors";
import LoadingOverlay from "../LoadingOverlay";
import useStoryInitScroll from "./useStoryInitScroll";

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
  const classes = useStyles();
  const contentContainerRef = React.useRef<HTMLDivElement>(null);
  useStorySetup(storyId);
  const fetchStatus = useSelector(
    selectors.storyFetchStateByStoryId.selectStoryFetchStatus(storyId)
  );
  const hasSessions =
    useSelector(
      selectors.misc.selectAllStoryParagraphs(
        storyId,
        editingSession && editingSession.id,
        editingSession && editingSession.finalEntry
      )
    ).length > 0;

  const onFocusOverlayClick = React.useCallback(() => focusOnTextArea(), [
    focusOnTextArea,
  ]);

  const hasScrolled = useStoryInitScroll(
    fetchStatus,
    contentContainerRef,
    hasSessions
  );

  // If the fetch status is null it means we are still fetching the stories
  let shouldShowLoading: boolean;

  // If we have finished fetching and there's no stories then don't show the loading
  if (fetchStatus !== null && !hasSessions) {
    shouldShowLoading = false;
    // If we have finished fetching and have sessions, then wait until scrolled
  } else if (fetchStatus !== null && hasScrolled) {
    shouldShowLoading = false;
  } else {
    shouldShowLoading = true;
  }

  return (
    <>
      <ToolBar />
      <StoryLayout
        canCurrentUserEdit={canCurrentUserEdit}
        renderMainContent={React.useCallback(
          ({ isOpen, toggleIsOpen, isWideScreen }: RenderProps) => (
            <>
              {shouldShowLoading && (
                <LoadingOverlay zIndex="STORY_LOADING_OVERLAY" />
              )}
              <div
                className={classes.contentContainer}
                ref={contentContainerRef}
              >
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
                      editingSessionFinalEntry={
                        editingSession && editingSession.finalEntry
                      }
                      editingSessionId={editingSession && editingSession.id}
                      textAreaRef={textAreaRef}
                      textAreaValue={textAreaValue}
                      onTextAreaBlur={onTextAreaBlur}
                      onTextAreaFocus={onTextAreaFocus}
                      onTextAreaChange={onTextAreaChange}
                      canCurrentUserEdit={canCurrentUserEdit}
                      isTextInvisible={shouldShowLoading}
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
            shouldShowLoading,
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
