import React from "react";
import clsx from "clsx";
import { v4 as uuid } from "uuid";
import { useSelector } from "react-redux";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import PeopleIcon from "@material-ui/icons/People";
import IconButton from "@material-ui/core/IconButton";
import Badge from "@material-ui/core/Badge";
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
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import CircularProgress from "@material-ui/core/CircularProgress";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import selectors from "../../store/selectors";
import { send } from "../../utils/socket";

const normalise = (value: number) => 100 - ((value - 0) * 100) / (20 - 0);

const actionBarHeight = 70;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    continueCard: {
      maxWidth: 250,
    },
    activeButtonWrapper: {
      position: "relative",
    },
    buttonProgress: {
      position: "absolute",
      top: "50%",
      left: "50%",
      marginTop: -12,
      marginLeft: -12,
    },
    actionBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: actionBarHeight,
      padding: theme.spacing(2),
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    peopleButton: {
      border: "1px solid #e2e2e2",
      backgroundColor: "white",
    },
    activeButton: {},
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
  isCurrentUserEditing,
  textAreaProps,
  isTextAreaFocussed,
  focusOnTextArea,
}: Props) {
  useSetUserDetails();
  useAddCurrentUserToStory(storyId);
  const userCount = (
    useSelector(selectors.misc.selectActiveStoryUsers(storyId)) || []
  ).length;
  const isCurrentUserActive = useSelector(
    selectors.misc.selectIsCurrentUserActiveInStory(storyId)
  );
  const sessions = useStoryHistory(storyId);
  const classes = useStyles(canCurrentUserEdit);

  const [isOpen, setIsOpen] = React.useState(true);
  const [activeButtonStatus, setActiveButtonStatus] = React.useState<
    ActiveButtonStatus
  >(null);

  let activeButtonState: ActiveButtonValue = isCurrentUserActive;

  if (
    activeButtonStatus &&
    activeButtonStatus.nextValue !== isCurrentUserActive
  ) {
    activeButtonState = "LOADING";
  }

  const handleToggleStatus = React.useCallback(() => {
    const newIsCurrentUserActive = !isCurrentUserActive;

    send({
      id: uuid(),
      createdAt: new Date().toISOString(),
      type: newIsCurrentUserActive
        ? "ADD_ACTIVE_USER_TO_STORY"
        : "REMOVE_ACTIVE_USER_FROM_STORY",
      payload: {
        storyId,
      },
    });

    setActiveButtonStatus(
      newIsCurrentUserActive
        ? {
            prevValue: false,
            nextValue: true,
          }
        : {
            prevValue: true,
            nextValue: false,
          }
    );
  }, [isCurrentUserActive, storyId]);

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
                <div className={classes.activeButtonWrapper}>
                  <Button
                    variant="contained"
                    color={activeButtonState ? "default" : "secondary"}
                    className={classes.activeButton}
                    startIcon={activeButtonState === true && <ArrowBackIcon />}
                    endIcon={activeButtonState === false && <AddIcon />}
                    onClick={handleToggleStatus}
                    disabled={activeButtonState === "LOADING"}
                  >
                    {activeButtonState === "LOADING" && "Updating..."}
                    {activeButtonState === true && "Leave as Editor"}
                    {activeButtonState === false && "Join as Editor"}
                  </Button>
                  {activeButtonState === "LOADING" && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </div>
                <IconButton
                  onClick={toggleIsOpen}
                  className={classes.peopleButton}
                >
                  <Badge
                    badgeContent={userCount}
                    color={userCount > 1 ? "primary" : "default"}
                    max={9}
                    showZero
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                  >
                    <PeopleIcon color={isOpen ? "primary" : "disabled"} />
                  </Badge>
                </IconButton>
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
