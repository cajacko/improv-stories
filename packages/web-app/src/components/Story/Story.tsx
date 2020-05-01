import React from "react";
import clsx from "clsx";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import useAddCurrentUserToStory from "../../hooks/useAddCurrentUserToStory";
import withLiveStoryEditor, {
  InjectedLiveStoryEditorProps,
} from "../../hoc/withLiveStoryEditor";
import useStoryHistory from "../../hooks/useStoryHistory";
import useSetUserDetails from "../../hooks/useSetUserDetails";
import ToolBar from "../ToolBar";
import styled from "styled-components";
import ConnectedUsers, { drawerWidth } from "../ConnectedUsers";
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import StoryActionBar, { height as actionBarHeight } from "./StoryActionBar";

const normalise = (value: number) => 100 - ((value - 0) * 100) / (20 - 0);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    continueCard: {
      maxWidth: 250,
    },
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
    cursor: {
      borderRight: `1px solid ${theme.palette.secondary.main}`,
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

const FocusButton = styled.button`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  border: 0;
  background-color: #00000090;
  appearance: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const TextArea = styled.textarea`
  position: absolute;
  left: -9999999px;
  width: 200px;
  height: 200px;
`;

const Cursor = styled.span`
  margin-left: 2px;
  animation: flash linear 1s infinite;
  @keyframes flash {
    0% {
      opacity: 1;
    }
    25% {
      opacity: 0;
    }
    75% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
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
  const sessions = useStoryHistory(storyId);
  const classes = useStyles(canCurrentUserEdit);

  const [isOpen, setIsOpen] = React.useState(true);

  const handleClose = React.useCallback(() => setIsOpen(false), [setIsOpen]);
  const toggleIsOpen = React.useCallback(() => setIsOpen(!isOpen), [
    setIsOpen,
    isOpen,
  ]);

  const editing = editingSession && {
    id: editingSession.id,
    text: editingSession.finalEntry,
  };

  let didAddEditingSession = false;

  let combinedSessions = sessions.reduce((acc, { finalEntry, id }) => {
    if (editing && editing.id === id) {
      didAddEditingSession = true;
      return `${acc}${editing.text}`;
    }

    return `${acc}${finalEntry}`;
  }, "");

  if (!didAddEditingSession && editing) {
    combinedSessions = `${combinedSessions}${editing.text}`;
  }

  const paragraphs = combinedSessions.split("\n").filter((text) => text !== "");

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
                  canCurrentUserEdit={canCurrentUserEdit}
                  isUsersDrawerOpen={isOpen}
                  toggleIsUsersDrawerOpen={toggleIsOpen}
                />
              </div>
              {!isTextAreaFocussed && canCurrentUserEdit && (
                <FocusButton onClick={() => focusOnTextArea()}>
                  <Card className={classes.continueCard}>
                    <CardContent>
                      <Typography variant="overline" color="error">
                        It's your turn! Click here to continue the story
                      </Typography>
                    </CardContent>
                  </Card>
                </FocusButton>
              )}
              <div className={classes.textContainer}>
                {paragraphs.map((text, i) => (
                  <p key={i}>
                    {text}
                    {paragraphs.length - 1 === i && canCurrentUserEdit && (
                      <Cursor className={classes.cursor} />
                    )}
                  </p>
                ))}
                <TextArea {...textAreaProps} />
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
