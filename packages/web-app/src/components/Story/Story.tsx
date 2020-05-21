import React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import { StoryProps, StoryOwnProps } from "./types";
import selectors from "../../store/selectors";
import StoryActionBar, { height as actionBarHeight } from "./StoryActionBar";
import StoryFocusOverlay from "./StoryFocusOverlay";
import StoryContent from "./StoryContent";
import StoryStatus from "./StoryStatus";
import StoryLayout, { RenderProps } from "./StoryLayout";
import getZIndex from "../../utils/getZIndex";
import StoryProgressBar from "./StoryProgressBar";
import useStorySetup from "../../hooks/useStorySetup";
import LoadingOverlay from "../LoadingOverlay";
import useStoryInitScroll from "../../hooks/useStoryInitScroll";
import StorySettings from "./StorySettings";
import withStoryEditor from "../../hoc/withStoryEditor";
import ProgressButton from "../ProgressButton";
import Button from "@material-ui/core/Button";
import {
  getLiveStoryTutorialText,
  getStandardStoryTutorialText,
} from "../../utils/getTutorialText";

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
    takeTurn: {
      justifyContent: "center",
      display: "flex",
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

function Story({
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
  type,
  requestTurnState,
  onRequestTakeTurn,
  playingSession,
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
      playingSessionId: playingSession && playingSession.session.id,
      playingSessionText: playingSession && playingSession.currentEntryText,
    })
  );

  const lastSession = useSelector((state) =>
    selectors.misc.selectLastStorySession(state, { storyId })
  );

  const onTakeTurnClick = React.useCallback(() => {
    onRequestTakeTurn(lastSession);
  }, [onRequestTakeTurn, lastSession]);

  const onFocusOverlayClick = React.useCallback(() => focusOnTextArea(), [
    focusOnTextArea,
  ]);

  const isPlayingSession = !!playingSession;

  const playingSessionUserName = useSelector((state) => {
    if (!playingSession) return null;

    const user = selectors.usersById.selectUser(state, {
      userId: playingSession.session.userId,
    });

    if (!user) return null;

    return user.name;
  });

  const playingSessionId = playingSession ? playingSession.session.id : null;
  const playingSessionText = playingSession
    ? playingSession.currentEntryText
    : null;

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

  const tutorialText =
    type === "LIVE"
      ? getLiveStoryTutorialText(window.location.href)
      : getStandardStoryTutorialText(window.location.href);

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
                    hideJoinButton={type === "STANDARD"}
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
                    tutorialText={tutorialText}
                    storyType={type}
                    playingSessionId={playingSessionId}
                    playingSessionText={playingSessionText}
                  >
                    <>
                      {requestTurnState !== "CANNOT_REQUEST_TURN" &&
                        !shouldShowLoading && (
                          <div className={classes.takeTurn}>
                            <ProgressButton
                              isLoading={requestTurnState === "REQUESTING"}
                            >
                              <Button
                                variant="contained"
                                color="secondary"
                                onClick={onTakeTurnClick}
                                disabled={
                                  requestTurnState !== "CAN_REQUEST_TURN"
                                }
                              >
                                {requestTurnState === "CAN_REQUEST_TURN"
                                  ? "Take Turn"
                                  : "Updating"}
                              </Button>
                            </ProgressButton>
                          </div>
                        )}
                    </>
                  </StoryContent>
                </div>
              </div>
              <StoryStatus
                storyId={storyId}
                editingSessionId={editingSession && editingSession.id}
                secondsLeftProps={secondsLeftProps}
                canCurrentUserEdit={canCurrentUserEdit}
                editingUser={editingUser}
                storyType={type}
                isPlayingSession={isPlayingSession}
                playingSessionUserName={playingSessionUserName}
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
            tutorialText,
            onTakeTurnClick,
            requestTurnState,
            type,
            isPlayingSession,
            playingSessionUserName,
            playingSessionId,
            playingSessionText,
          ]
        )}
        renderDrawerContent={React.useCallback(
          ({ handleClose }) => (
            <StorySettings
              storyId={storyId}
              handleClose={handleClose}
              storyType={type}
            />
          ),
          [storyId, type]
        )}
      />
    </div>
  );
}

export default withStoryEditor<StoryOwnProps>(React.memo(Story));
