import React from "react";
import {
  makeStyles,
  createStyles,
  Theme,
  withStyles,
} from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import selectors from "../../store/selectors";
import StoryActionBar, { height as actionBarHeight } from "./StoryActionBar";
import StoryFocusOverlay from "./StoryFocusOverlay";
import StoryContent from "./StoryContent";
import StoryStatus from "./StoryStatus";
import StoryLayout, { RenderProps } from "./StoryLayout";
import getZIndex from "../../utils/getZIndex";
import StoryProgressBar from "./StoryProgressBar";
import LoadingOverlay from "../LoadingOverlay";
import useStoryInitScroll from "../../hooks/useStoryInitScroll";
import StorySettings from "./StorySettings";
import ProgressButton from "../ProgressButton";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/HelpOutline";
import withGetTutorialText from "../../utils/withGetTutorialText";
import StoryContext from "../../context/StoryEditor";
import useCanCurrentUserEditStory from "../../hooks/useCanCurrentUserEditStory";
import useRequestStoryTurn from "../../hooks/useRequestStoryTurn";
import playStoryTimeout from "../../config/playStoryTimeout";
import PlayingStorySession from "../../context/PlayingStorySession";
import StoryTutorialText from "./StoryTutorialText";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";

const DialogContent = withStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    actionBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: getZIndex("STORY_ACTION_BAR"),
    },
    helpButton: {
      justifyContent: "center",
      display: "flex",
      marginTop: 10,
    },
    textContainer: {
      paddingTop: actionBarHeight,
      position: "relative",
      width: "100%",
      display: "flex",
      justifyContent: "center",
    },
    takeTurn: {
      justifyContent: "center",
      display: "flex",
      marginTop: 20,
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

interface Props {
  storyId: string;
  type: "LIVE" | "STANDARD";
}

function Story({ storyId, type }: Props) {
  const classes = useStyles();
  const { playStorySession, playingStorySessionId } = React.useContext(
    PlayingStorySession
  );
  const isPlaying = !!playingStorySessionId;
  const { isTextAreaFocussed, focusOnTextArea } = React.useContext(
    StoryContext
  );
  const contentContainerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const canCurrentUserEditStory = useCanCurrentUserEditStory(storyId, type);
  const { onRequestTakeTurn, requestTurnState } = useRequestStoryTurn(
    storyId,
    type
  );

  const fetchStatus = useSelector((state) =>
    selectors.storyFetchStateByStoryId.selectStoryFetchStatus(state, {
      storyId,
    })
  );
  const doesStoryHaveContent = useSelector((state) =>
    selectors.misc.selectDoesStoryHaveContent(state, { storyId })
  );

  const lastSession = useSelector((state) =>
    selectors.misc.selectLastStorySession(state, { storyId })
  );

  const onTakeTurnClick = React.useCallback(() => {
    let buffer: number | null = null;

    if (lastSession) {
      playStorySession(lastSession.id);
      buffer = lastSession.entries.length * playStoryTimeout;
    }

    onRequestTakeTurn(buffer);
  }, [onRequestTakeTurn, lastSession, playStorySession]);

  const hasScrolled = useStoryInitScroll(
    fetchStatus,
    contentContainerRef,
    contentRef,
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

  const getTutorialText = withGetTutorialText(type, window.location.href);

  const [isTutorialModalOpen, setIsTutorialModalOpen] = React.useState(false);

  const handleTutorialModalClose = React.useCallback(
    () => setIsTutorialModalOpen(false),
    []
  );
  const handleTutorialModalShow = React.useCallback(
    () => setIsTutorialModalOpen(true),
    []
  );

  return (
    <div className={classes.container}>
      {shouldShowLoading && <LoadingOverlay zIndex="STORY_LOADING_OVERLAY" />}
      <StoryLayout
        storyId={storyId}
        storyType={type}
        renderMainContent={React.useCallback(
          ({ isOpen, toggleIsOpen, isWideScreen }: RenderProps) => (
            <>
              <div
                className={classes.contentContainer}
                ref={contentContainerRef}
              >
                <div className={classes.actionBar}>
                  {!isWideScreen && (
                    <div className={classes.storyProgressBar}>
                      <StoryProgressBar storyId={storyId} color="secondary" />
                    </div>
                  )}

                  <StoryActionBar
                    storyId={storyId}
                    isStorySettingsDrawerOpen={isOpen}
                    toggleIsSettingsDrawerOpen={toggleIsOpen}
                    hideJoinButton={type === "STANDARD"}
                  />
                </div>
                {canCurrentUserEditStory && !isTextAreaFocussed && (
                  <StoryFocusOverlay onClick={focusOnTextArea} />
                )}
                <div
                  className={classes.textContainer}
                  ref={contentRef}
                  onClick={focusOnTextArea}
                >
                  <StoryContent
                    storyId={storyId}
                    tutorialText={getTutorialText("NEW_STORY_PLACEHOLDER")}
                    storyType={type}
                    isTextInvisible={shouldShowLoading}
                  >
                    {({ showingTutorialText }) => (
                      <>
                        <div className={classes.takeTurn}>
                          {!shouldShowLoading &&
                            requestTurnState !== "CANNOT_REQUEST_TURN" && (
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
                            )}
                        </div>
                        {!shouldShowLoading &&
                          !canCurrentUserEditStory &&
                          !isPlaying && (
                            <div className={classes.helpButton}>
                              <IconButton
                                aria-label="delete"
                                onClick={handleTutorialModalShow}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </div>
                          )}
                      </>
                    )}
                  </StoryContent>
                </div>
              </div>
              <StoryStatus storyId={storyId} storyType={type} />
            </>
          ),
          [
            classes,
            storyId,
            isTextAreaFocussed,
            canCurrentUserEditStory,
            focusOnTextArea,
            shouldShowLoading,
            getTutorialText,
            onTakeTurnClick,
            requestTurnState,
            type,
            isPlaying,
            handleTutorialModalShow,
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

      <Dialog open={isTutorialModalOpen} onClose={handleTutorialModalClose}>
        <DialogContent dividers>
          <StoryTutorialText text={getTutorialText("GENERIC_FULL_HELP")} />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleTutorialModalClose} color="default">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default React.memo(Story);
