import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import selectors from "../../store/selectors";
import StorySession from "./StorySession";
import StoryTutorialText from "./StoryTutorialText";
import StoryStatus from "../../context/StoryStatus";
import { GetTutorialText } from "../../utils/withGetTutorialText";

type RenderProp = (props: { showingTutorialText: boolean }) => JSX.Element;

export interface Props {
  storyId: string;
  getTutorialText: GetTutorialText;
  children?: JSX.Element | RenderProp;
  storyType: "LIVE" | "STANDARD";
  isTextInvisible: boolean;
}

const width = 500;

const useStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    container: {
      maxWidth: width,
      width: "100%",
      // margin: 20,
      padding: "0 20px 100vh",
    },
    contentContainer: {
      margin: 20,
    },
  })
);

function StoryContent({
  children,
  storyId,
  getTutorialText,
  storyType,
  isTextInvisible,
}: Props) {
  const { sessionsTextStatus } = React.useContext(StoryStatus);
  const storySessionIds =
    useSelector((state) =>
      selectors.sessionIdsByStoryId.selectStorySessionIds(state, { storyId })
    ) || [];

  const showTutorialText =
    !storySessionIds.length || sessionsTextStatus === "DOES_NOT_HAVE_CONTENT";

  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.contentContainer}>
        {storySessionIds.map((sessionId, i) => (
          <StorySession
            key={sessionId}
            isTextInvisible={isTextInvisible || showTutorialText}
            storyType={storyType}
            sessionId={sessionId}
            storyId={storyId}
            isLastSession={storySessionIds.length - 1 === i}
            setSessionTextType={
              storyType === "LIVE"
                ? "LIVE_STORY_SET_SESSION_TEXT"
                : "STANDARD_STORY_SET_SESSION_TEXT"
            }
          />
        ))}

        {showTutorialText && (
          <StoryTutorialText
            text={getTutorialText("NEW_STORY_PLACEHOLDER", {
              hasEntries: !!storySessionIds.length,
            })}
            isTextInvisible={isTextInvisible}
            isFaded
          />
        )}

        {typeof children === "function"
          ? children({ showingTutorialText: showTutorialText })
          : children}
      </div>
    </div>
  );
}

export default React.memo(StoryContent);
