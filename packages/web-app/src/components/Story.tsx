import React from "react";
import clsx from "clsx";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import PeopleIcon from "@material-ui/icons/People";
import IconButton from "@material-ui/core/IconButton";
import useStoryUsers from "../hooks/useStoryUsers";
import Badge from "@material-ui/core/Badge";
import useAddCurrentUserToStory from "../hooks/useAddCurrentUserToStory";
import withLiveStoryEditor, {
  InjectedLiveStoryEditorProps,
} from "../hoc/withLiveStoryEditor";
import useStoryHistory from "../hooks/useStoryHistory";
import useSetUserDetails from "../hooks/useSetUserDetails";
import ToolBar from "./ToolBar";
import styled from "styled-components";
import ConnectedUsers, { drawerWidth } from "./ConnectedUsers";
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";

const normalise = (value: number) => 100 - ((value - 0) * 100) / (20 - 0);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    peopleButton: {
      position: "absolute",
      top: theme.spacing(2),
      right: theme.spacing(2),
      border: "1px solid #e2e2e2",
      backgroundColor: "white",
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
      color: theme.palette.secondary.main,
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

interface Props extends OwnProps, InjectedLiveStoryEditorProps {}

function Story({
  storyId,
  currentUserCanEdit,
  currentlyEditingUser,
  text,
  countDownTimer,
}: Props) {
  useSetUserDetails();
  // TODO: this needs to constantly request user names from onlineIds with no name
  // useGetUsers(storyId);
  useAddCurrentUserToStory(storyId);
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const userCount = useStoryUsers(storyId).length;
  const entries = useStoryHistory(storyId);
  const classes = useStyles(currentUserCanEdit);

  const [isOpen, setIsOpen] = React.useState(true);

  const handleClose = React.useCallback(() => setIsOpen(false), [setIsOpen]);
  const toggleIsOpen = React.useCallback(() => setIsOpen(!isOpen), [
    setIsOpen,
    isOpen,
  ]);

  let combinedEntries = entries.reduce(
    (acc, { finalText }) => `${acc}${finalText}`,
    ""
  );

  combinedEntries = `${combinedEntries}${text}`;

  const paragraphs = combinedEntries.split("\n").filter((text) => text !== "");

  const focusOnTextArea = React.useCallback(() => {
    if (textAreaRef.current && currentUserCanEdit) {
      textAreaRef.current.focus();
    }
  }, [textAreaRef, currentUserCanEdit]);

  React.useLayoutEffect(focusOnTextArea, [focusOnTextArea]);

  let editorName = null;

  if (currentUserCanEdit) {
    editorName = "You are editing! Start typing.";
  } else if (currentlyEditingUser) {
    editorName = currentlyEditingUser.name || "Anonymous";
    editorName = `${editorName} is editing`;
  }

  return (
    <>
      <ToolBar />
      <Container onClick={currentUserCanEdit ? focusOnTextArea : undefined}>
        <div
          className={clsx(classes.content, {
            [classes.contentShift]: isOpen,
          })}
        >
          <ContentContainer>
            <Content>
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
              {paragraphs.map((text, i) => (
                <p key={i}>
                  {text}
                  {paragraphs.length - 1 === i && (
                    <Cursor className={classes.cursor}>|</Cursor>
                  )}
                </p>
              ))}
            </Content>
          </ContentContainer>

          {editorName && (
            <div className={classes.footer}>
              <Typography className={classes.name}>{editorName}</Typography>
              {countDownTimer !== null && (
                <>
                  <Typography className={classes.time}>
                    {countDownTimer}
                  </Typography>
                  <LinearProgress
                    className={classes.progress}
                    variant="determinate"
                    color={currentUserCanEdit ? "primary" : "secondary"}
                    value={normalise(countDownTimer)}
                  />
                </>
              )}
            </div>
          )}
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
