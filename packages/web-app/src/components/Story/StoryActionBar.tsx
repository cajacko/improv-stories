import React from "react";
import { v4 as uuid } from "uuid";
import { useSelector } from "react-redux";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import PeopleIcon from "@material-ui/icons/People";
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
  isUsersDrawerOpen: boolean;
  toggleIsUsersDrawerOpen: () => void;
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

type ActiveButtonValue = "LOADING" | true | false;

function StoryActionBar({
  storyId,
  isUsersDrawerOpen,
  toggleIsUsersDrawerOpen,
  disableButtons,
}: Props) {
  const userCount = (
    useSelector(selectors.misc.selectActiveStoryUsers(storyId)) || []
  ).length;
  const isCurrentUserActive = useSelector(
    selectors.misc.selectIsCurrentUserActiveInStory(storyId)
  );
  const fetchStatus = useSelector(
    selectors.storyFetchStateByStoryId.selectStoryFetchStatus(storyId)
  );
  const classes = useStyles();

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

  let isJoinButtonDisabled = disableButtons;

  if (fetchStatus !== "FETCHED_NOW_LISTENING" && !isCurrentUserActive) {
    isJoinButtonDisabled = true;
  } else if (activeButtonState === "LOADING") {
    isJoinButtonDisabled = true;
  }

  return (
    <div className={classes.actionBar}>
      <div className={classes.activeButtonWrapper}>
        <Button
          variant="contained"
          color={activeButtonState ? "default" : "secondary"}
          className={classes.activeButton}
          startIcon={activeButtonState === true && <ArrowBackIcon />}
          endIcon={activeButtonState === false && <AddIcon />}
          onClick={isJoinButtonDisabled ? undefined : handleToggleStatus}
          disabled={isJoinButtonDisabled}
        >
          {activeButtonState === "LOADING" && "Updating..."}
          {activeButtonState === true && "Leave as Editor"}
          {activeButtonState === false && "Join as Editor"}
        </Button>
        {activeButtonState === "LOADING" && (
          <CircularProgress size={24} className={classes.buttonProgress} />
        )}
      </div>
      <IconButton
        onClick={disableButtons ? undefined : toggleIsUsersDrawerOpen}
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
          <PeopleIcon color={isUsersDrawerOpen ? "primary" : "disabled"} />
        </Badge>
      </IconButton>
    </div>
  );
}

export default React.memo(StoryActionBar);
