import React from "react";
import { v4 as uuid } from "uuid";
import { useSelector } from "react-redux";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import SettingsIcon from "@material-ui/icons/Settings";
import IconButton from "@material-ui/core/IconButton";
import Badge from "@material-ui/core/Badge";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import CircularProgress from "@material-ui/core/CircularProgress";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import selectors from "../../store/selectors";
import { send } from "../../utils/socket";

export const height = 70;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
      height: height,
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
  })
);

interface Props {
  storyId: string;
  isStorySettingsDrawerOpen: boolean;
  toggleIsSettingsDrawerOpen: () => void;
  disableButtons?: boolean;
}

interface GenericActiveButtonStatus<P, N> {
  prevValue: P;
  nextValue: N;
}

type ActiveButtonStatus =
  | GenericActiveButtonStatus<true, false>
  | GenericActiveButtonStatus<false, true>
  | null;

type ActiveButtonValue =
  | "LOADING"
  | "NO_NAME"
  | "IS_STORY_EDITOR"
  | "IS_NOT_STORY_EDITOR";

function StoryActionBar({
  storyId,
  isStorySettingsDrawerOpen,
  toggleIsSettingsDrawerOpen,
  disableButtons,
}: Props) {
  const userCount = (
    useSelector((state) =>
      selectors.misc.selectStoryUsers(state, {
        storyId,
        storyUserType: "ACTIVE",
      })
    ) || []
  ).length;
  const isCurrentUserActive = useSelector((state) =>
    selectors.misc.selectIsCurrentUserActiveInStory(state, { storyId })
  );
  const fetchStatus = useSelector((state) =>
    selectors.storyFetchStateByStoryId.selectStoryFetchStatus(state, {
      storyId,
    })
  );
  const currentUserName = useSelector(selectors.currentUser.selectCurrentUser)
    .name;
  const classes = useStyles();

  const hasName = currentUserName && currentUserName.length > 0;

  const [activeButtonStatus, setActiveButtonStatus] = React.useState<
    ActiveButtonStatus
  >(null);

  let activeButtonState: ActiveButtonValue = !hasName
    ? "NO_NAME"
    : isCurrentUserActive
    ? "IS_STORY_EDITOR"
    : "IS_NOT_STORY_EDITOR";

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

  let isJoinButtonDisabled =
    disableButtons || fetchStatus !== "FETCHED_NOW_LISTENING";

  let joinButtonStartIcon: JSX.Element | undefined;
  let joinButtonEndIcon: JSX.Element | undefined;
  let joinButtonText: string;
  let joinButtonColor: "default" | "secondary" = "default";

  switch (activeButtonState) {
    case "IS_NOT_STORY_EDITOR":
      joinButtonEndIcon = <AddIcon />;
      joinButtonText = "Join as Editor";
      joinButtonColor = "secondary";
      break;
    case "IS_STORY_EDITOR":
      joinButtonStartIcon = <ArrowBackIcon />;
      joinButtonText = "Leave as Editor";
      break;
    case "NO_NAME":
      joinButtonText = "Set a name to join";
      isJoinButtonDisabled = true;
      break;
    case "LOADING":
    default:
      isJoinButtonDisabled = true;
      joinButtonText = "Updating...";
      break;
  }

  return (
    <div className={classes.actionBar}>
      <div className={classes.activeButtonWrapper}>
        <Button
          variant="contained"
          color={joinButtonColor}
          className={classes.activeButton}
          startIcon={joinButtonStartIcon}
          endIcon={joinButtonEndIcon}
          onClick={isJoinButtonDisabled ? undefined : handleToggleStatus}
          disabled={isJoinButtonDisabled}
        >
          {joinButtonText}
        </Button>
        {activeButtonState === "LOADING" && (
          <CircularProgress size={24} className={classes.buttonProgress} />
        )}
      </div>
      <IconButton
        onClick={disableButtons ? undefined : toggleIsSettingsDrawerOpen}
        className={classes.peopleButton}
        disabled={disableButtons}
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
          <SettingsIcon
            color={isStorySettingsDrawerOpen ? "primary" : "disabled"}
          />
        </Badge>
      </IconButton>
    </div>
  );
}

export default React.memo(StoryActionBar);
