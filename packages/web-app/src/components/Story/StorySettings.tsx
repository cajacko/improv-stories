import React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import selectors from "../../store/selectors";
import StoryUsers from "./StoryUsers";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ListItemText from "@material-ui/core/ListItemText";
import TextField from "@material-ui/core/TextField";
import ListItem from "@material-ui/core/ListItem";
import InputAdornment from "@material-ui/core/InputAdornment";
import TimelapseIcon from "@material-ui/icons/Timelapse";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import { useStoryPropsRef } from "../../hooks/useStoryRef";
import { StoryPropsContent } from "../../store/storyPropsByStoryId/types";
import { DatabaseStoryProps } from "../../sharedTypes";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    titleText: {
      textAlign: "right",
    },
    drawerHeader: {
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
      justifyContent: "space-between",
    },
    headerText: {
      textDecoration: "underline",
    },
  })
);

interface Props {
  storyId: string;
  handleClose: () => void;
}

const min = 5;
const max = 60;

type State = StoryPropsContent<number | null>;
type Action =
  | { type: "SET_SECONDS_PER_ROUND"; payload: number | null }
  | { type: "SET_STORY_PROPS"; payload: StoryPropsContent };

function reducer(state: State, action: Action): State {
  if (!state) return state;

  switch (action.type) {
    case "SET_SECONDS_PER_ROUND":
      return { ...state, secondsPerRound: action.payload };
    case "SET_STORY_PROPS":
      return action.payload;
  }
}

function Story({ storyId, handleClose }: Props) {
  const savedStoryProps =
    useSelector((state) =>
      selectors.storyPropsByStoryId.selectStoryPropsContent(state, { storyId })
    ) || null;

  const classes = useStyles();

  const [editingStoryProps, dispatch] = React.useReducer(
    reducer,
    savedStoryProps
  );

  const storyPropsRef = useStoryPropsRef(storyId);

  React.useEffect(() => {
    dispatch({
      type: "SET_STORY_PROPS",
      payload: savedStoryProps,
    });
  }, [savedStoryProps]);

  const onChangeSecondsPerTurn = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value === "") {
        dispatch({ type: "SET_SECONDS_PER_ROUND", payload: null });
        return;
      }

      const value = parseInt(event.target.value, 10);
      dispatch({ type: "SET_SECONDS_PER_ROUND", payload: value });
    },
    []
  );

  const onSave = React.useCallback(() => {
    const { secondsPerRound } = editingStoryProps;

    if (!storyPropsRef || secondsPerRound === null) {
      return;
    }

    const storyProps: DatabaseStoryProps = {
      storyId,
      storyPropsVersion: 1,
      storyPropsDateCreated: new Date().toISOString(),
      storyPropsDateModified: new Date().toISOString(),
      ...editingStoryProps,
      secondsPerRound,
    };

    // TODO: Should we optimistically set the data in redux as well?
    storyPropsRef.set(storyProps);
  }, [editingStoryProps, storyPropsRef, storyId]);

  let shouldShowHelperText = false;

  if (
    editingStoryProps.secondsPerRound === null ||
    editingStoryProps.secondsPerRound > max ||
    editingStoryProps.secondsPerRound < min
  ) {
    shouldShowHelperText = true;
  }

  const isSaveDisabled =
    savedStoryProps.secondsPerRound === editingStoryProps.secondsPerRound ||
    shouldShowHelperText;

  return (
    <>
      <div className={classes.drawerHeader}>
        {!!handleClose && (
          <IconButton onClick={handleClose}>
            <ChevronRightIcon />
          </IconButton>
        )}
        <ListItemText primary="Story Settings" className={classes.titleText} />
      </div>
      <Divider />
      <List>
        <ListItem>
          <ListItemText
            className={classes.headerText}
            primary="General Settings"
          />
        </ListItem>
        <ListItem>
          <TextField
            fullWidth
            error={shouldShowHelperText}
            id="filled-error-helper-text"
            label="Seconds per turn"
            value={
              editingStoryProps.secondsPerRound === undefined
                ? ""
                : editingStoryProps.secondsPerRound
            }
            helperText={
              shouldShowHelperText && `Must be between ${min} - ${max}`
            }
            onChange={onChangeSecondsPerTurn}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TimelapseIcon />
                </InputAdornment>
              ),
            }}
          />
        </ListItem>
        <ListItem>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            disabled={isSaveDisabled}
            onClick={isSaveDisabled ? undefined : onSave}
          >
            Save
          </Button>
        </ListItem>
      </List>
      <Divider />
      <StoryUsers storyId={storyId} />
    </>
  );
}

export default React.memo(Story);
