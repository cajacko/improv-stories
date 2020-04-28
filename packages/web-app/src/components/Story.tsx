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
      padding: theme.spacing(3),
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginRight: -drawerWidth,
      flexDirection: "column",
      position: "relative",
    },
    contentShift: {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 0,
    },
  })
);

const Container = styled.div`
  display: flex;
  flex: 1;
  overflow: auto;
  flex-direction: row;
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
  onTextChange,
  countDownTimer,
}: Props) {
  useSetUserDetails();
  // TODO: this needs to constantly request user names from onlineIds with no name
  // useGetUsers(storyId);
  useAddCurrentUserToStory(storyId);
  const userCount = useStoryUsers(storyId).length;
  const entries = useStoryHistory(storyId);
  const classes = useStyles();

  const [isOpen, setIsOpen] = React.useState(true);

  const handleClose = React.useCallback(() => setIsOpen(false), [setIsOpen]);
  const toggleIsOpen = React.useCallback(() => setIsOpen(!isOpen), [
    setIsOpen,
    isOpen,
  ]);

  return (
    <>
      <ToolBar storyId={storyId} />
      <Container>
        <div
          className={clsx(classes.content, {
            [classes.contentShift]: isOpen,
          })}
        >
          <IconButton onClick={toggleIsOpen} className={classes.peopleButton}>
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
          {entries.map((entry) => (
            <p key={entry.id}>{entry.finalText}</p>
          ))}

          <p>
            {currentUserCanEdit
              ? "Edit!"
              : currentlyEditingUser
              ? `${currentlyEditingUser.name} is editing`
              : "No one editing"}
          </p>
          <textarea
            value={text}
            onChange={onTextChange}
            disabled={!currentUserCanEdit}
          >
            {text}
          </textarea>
          {countDownTimer !== null && <p>Time Left: {countDownTimer}</p>}
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
