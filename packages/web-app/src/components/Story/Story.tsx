import React from "react";
import clsx from "clsx";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import useAddCurrentUserToStory from "../../hooks/useAddCurrentUserToStory";
import withLiveStoryEditor, {
  InjectedLiveStoryEditorProps,
} from "../../hoc/withLiveStoryEditor";
import useSetUserDetails from "../../hooks/useSetUserDetails";
import ToolBar from "../ToolBar";
import styled from "styled-components";
import ConnectedUsers, { drawerWidth } from "../ConnectedUsers";
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";
import StoryActionBar, { height as actionBarHeight } from "./StoryActionBar";
import StoryFocusOverlay from "./StoryFocusOverlay";
import StoryContent from "./StoryContent";

const normalise = (value: number) => 100 - ((value - 0) * 100) / (20 - 0);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    actionBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
    },
    content: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginRight: -drawerWidth,
      position: "relative",
    },
    contentShift: {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 0,
    },
    textContainer: {
      paddingTop: actionBarHeight,
    },
    footer: {
      width: "100%",
      display: "flex",
      height: "50px",
      backgroundColor: (isActive) =>
        isActive ? theme.palette.secondary.main : theme.palette.primary.main,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    name: {
      color: theme.palette.background.default,
    },
    time: {
      color: theme.palette.background.default,
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      padding: theme.spacing(2),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    progress: {
      position: "absolute",
      bottom: 0,
      right: 0,
      left: 0,
    },
  })
);

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  overflow: hidden;
`;

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  overflow: auto;
`;

const Content = styled.div`
  max-width: 500px;
  width: 100%;
  margin: 20px;
  padding: 0 20px;
`;

interface OwnProps {
  storyId: string;
}

type Props = OwnProps & InjectedLiveStoryEditorProps;

interface GenericActiveButtonStatus<P, N> {
  prevValue: P;
  nextValue: N;
}

type ActiveButtonStatus =
  | GenericActiveButtonStatus<true, false>
  | GenericActiveButtonStatus<false, true>
  | null;

type ActiveButtonValue = "LOADING" | true | false;

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
  const classes = useStyles(canCurrentUserEdit);

  const [isOpen, setIsOpen] = React.useState(true);

  const handleClose = React.useCallback(() => setIsOpen(false), [setIsOpen]);
  const toggleIsOpen = React.useCallback(() => setIsOpen(!isOpen), [
    setIsOpen,
    isOpen,
  ]);

  let statusText = "Waiting for more users to join...";

  if (editingSession) {
    if (secondsLeft && secondsLeft >= 0) {
      if (canCurrentUserEdit) {
        statusText = "You are editing! Start typing.";
      } else {
        statusText = (editingUser && editingUser.name) || "Anonymous";
        statusText = `${statusText} is editing`;
      }
    } else {
      statusText = "Updating...";
    }
  }

  let seconds = secondsLeft !== null && secondsLeft < 0 ? 0 : secondsLeft;

  const onFocusOverlayClick = React.useCallback(() => focusOnTextArea(), [
    focusOnTextArea,
  ]);

  return (
    <>
      <ToolBar />
      <Container>
        <div
          className={clsx(classes.content, {
            [classes.contentShift]: isOpen,
          })}
        >
          <ContentContainer>
            <Content>
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
            </Content>
          </ContentContainer>

          <div className={classes.footer}>
            <Typography className={classes.name}>{statusText}</Typography>
            {seconds !== null && (
              <>
                <Typography className={classes.time}>{seconds}</Typography>
                <LinearProgress
                  className={classes.progress}
                  variant="determinate"
                  color={canCurrentUserEdit ? "primary" : "secondary"}
                  value={normalise(seconds)}
                />
              </>
            )}
          </div>
        </div>
        <ConnectedUsers
          storyId={storyId}
          isOpen={isOpen}
          handleClose={handleClose}
        />
      </Container>
    </>
  );
}

export default withLiveStoryEditor<OwnProps>(Story);
