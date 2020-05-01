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
import StoryActionBar, { height as actionBarHeight } from "./StoryActionBar";
import StoryFocusOverlay from "./StoryFocusOverlay";
import StoryContent from "./StoryContent";
import StoryStatus from "./StoryStatus";

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
  const classes = useStyles();

  const [isOpen, setIsOpen] = React.useState(true);

  const handleClose = React.useCallback(() => setIsOpen(false), [setIsOpen]);
  const toggleIsOpen = React.useCallback(() => setIsOpen(!isOpen), [
    setIsOpen,
    isOpen,
  ]);

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

          <StoryStatus
            isEditingSessionActive={!!editingSession}
            secondsLeft={secondsLeft}
            canCurrentUserEdit={canCurrentUserEdit}
            editingUserName={editingUser && editingUser.name}
          />
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
