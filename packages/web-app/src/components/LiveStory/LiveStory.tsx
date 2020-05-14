import React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import { StoryProps, StoryOwnProps } from "../Story/types";
import selectors from "../../store/selectors";
import StoryActionBar, {
  height as actionBarHeight,
} from "../Story/StoryActionBar";
import StoryFocusOverlay from "../Story/StoryFocusOverlay";
import LiveStoryContent from "./LiveStoryContent";
import LiveStoryStatus from "./LiveStoryStatus";
import StoryLayout, { RenderProps } from "../Story/StoryLayout";
import getZIndex from "../../utils/getZIndex";
import StoryProgressBar from "../Story/StoryProgressBar";
import useStorySetup from "../../hooks/useStorySetup";
import LoadingOverlay from "../LoadingOverlay";
import useStoryInitScroll from "../../hooks/useStoryInitScroll";
import StorySettings from "../Story/StorySettings";
import withLiveStoryEditor from "../../hoc/withLiveStoryEditor";

const useStyles = makeStyles((theme: Theme) =>
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
      position: "relative",
    },
    contentContainer: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
      alignItems: "center",
      overflow: "auto",
    },
    container: {
      display: "flex",
      flex: 1,
      flexDirection: "row",
      overflow: "hidden",
      position: "relative",
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

function LiveStory({
  storyId,
  editingSession,
  editingUser,
  secondsLeftProps,
  canCurrentUserEdit,
  isTextAreaFocussed,
  focusOnTextArea,
  textAreaRef,
  textAreaValue,
  onTextAreaBlur,
  onTextAreaFocus,
  onTextAreaChange,
}: StoryProps) {
  const classes = useStyles();
  const contentContainerRef = React.useRef<HTMLDivElement>(null);
  useStorySetup(storyId);
  const fetchStatus = useSelector((state) =>
    selectors.storyFetchStateByStoryId.selectStoryFetchStatus(state, {
      storyId,
    })
  );
  const doesStoryHaveContent = useSelector((state) =>
    selectors.misc.selectDoesStoryHaveContent(state, {
      storyId,
      editingSessionId: editingSession && editingSession.id,
      editingSessionFinalEntry: editingSession && editingSession.finalEntry,
    })
  );

  const onFocusOverlayClick = React.useCallback(() => focusOnTextArea(), [
    focusOnTextArea,
  ]);

  const hasScrolled = useStoryInitScroll(
    fetchStatus,
    contentContainerRef,
    doesStoryHaveContent
  );

  // If the fetch status is null it means we are still fetching the stories
  let shouldShowLoading: boolean;

  // If we have finished fetching and there's no stories then don't show the loading
  if (fetchStatus !== null && !doesStoryHaveContent) {
    shouldShowLoading = false;
    // If we have finished fetching and have sessions, then wait until scrolled
  } else if (fetchStatus !== null && hasScrolled) {
    shouldShowLoading = false;
  } else {
    shouldShowLoading = true;
  }

  return (
    <div className={classes.container}>
      {shouldShowLoading && <LoadingOverlay zIndex="STORY_LOADING_OVERLAY" />}
      <StoryLayout
        canCurrentUserEdit={canCurrentUserEdit}
        renderMainContent={React.useCallback(
          ({ isOpen, toggleIsOpen, isWideScreen }: RenderProps) => (
            <>
              <div
                className={classes.contentContainer}
                ref={contentContainerRef}
              >
                <div className={classes.actionBar}>
                  {!isWideScreen &&
                    secondsLeftProps !== null &&
                    isTextAreaFocussed && (
                      <div className={classes.storyProgressBar}>
                        <StoryProgressBar
                          value={secondsLeftProps.secondsLeft}
                          maxValue={secondsLeftProps.totalSeconds}
                          color="secondary"
                        />
                      </div>
                    )}

                  <StoryActionBar
                    storyId={storyId}
                    isStorySettingsDrawerOpen={isOpen}
                    toggleIsSettingsDrawerOpen={toggleIsOpen}
                  />
                </div>
                {!isTextAreaFocussed && canCurrentUserEdit && (
                  <StoryFocusOverlay onClick={onFocusOverlayClick} />
                )}
                <div className={classes.textContainer}>
                  <LiveStoryContent
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
              <LiveStoryStatus
                storyId={storyId}
                editingSessionId={editingSession && editingSession.id}
                secondsLeftProps={secondsLeftProps}
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
            secondsLeftProps,
            editingUser,
            onFocusOverlayClick,
            shouldShowLoading,
          ]
        )}
        renderDrawerContent={React.useCallback(
          ({ handleClose }) => (
            <StorySettings storyId={storyId} handleClose={handleClose} />
          ),
          [storyId]
        )}
      />
    </div>
  );
}

export default withLiveStoryEditor<StoryOwnProps>(React.memo(LiveStory));
