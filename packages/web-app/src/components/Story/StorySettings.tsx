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
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import InputLabel from "@material-ui/core/InputLabel";
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
  storyType: "LIVE" | "STANDARD";
}

const min = 5;
const max = 300;

type InputValues = StoryPropsContent<number | null>;
type State = Partial<InputValues>;

type Action =
  | { type: "SET_SECONDS_PER_ROUND"; payload?: number | null }
  | { type: "RESET"; payload?: undefined }
  | { type: "SET_CAN_USERS_END_ROUND_EARLY"; payload?: boolean };

function reducer(state: State, action: Action): State {
  if (!state) return state;

  switch (action.type) {
    case "SET_CAN_USERS_END_ROUND_EARLY":
      return { ...state, canUsersEndRoundEarly: action.payload };
    case "SET_SECONDS_PER_ROUND":
      return { ...state, secondsPerRound: action.payload };
    case "RESET":
      return {};
  }
}

function Story({ storyId, handleClose, storyType }: Props) {
  const savedStoryProps =
    useSelector((state) =>
      selectors.storyPropsByStoryId.selectStoryPropsContent(state, { storyId })
    ) || null;

  const classes = useStyles();

  const [editingStoryProps, dispatchEditingStoryProps] = React.useReducer(
    reducer,
    {}
  );

  const storyPropsRef = useStoryPropsRef(storyId);

  const onChangeSecondsPerTurn = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value === "") {
        dispatchEditingStoryProps({
          type: "SET_SECONDS_PER_ROUND",
          payload: null,
        });
        return;
      }

      const value = parseInt(event.target.value, 10);

      dispatchEditingStoryProps({
        type: "SET_SECONDS_PER_ROUND",
        payload: value === savedStoryProps.secondsPerRound ? undefined : value,
      });
    },
    [dispatchEditingStoryProps, savedStoryProps.secondsPerRound]
  );

  const onChangeCanUsersEndRoundEarly = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.checked;

      dispatchEditingStoryProps({
        type: "SET_CAN_USERS_END_ROUND_EARLY",
        payload:
          value === savedStoryProps.canUsersEndRoundEarly ? undefined : value,
      });
    },
    [dispatchEditingStoryProps, savedStoryProps.canUsersEndRoundEarly]
  );

  const inputStoryPropsValues: InputValues = Object.keys(
    savedStoryProps
  ).reduce((acc, key) => {
    // @ts-ignore
    const editingStoryProp = editingStoryProps[key];

    if (editingStoryProp === undefined) return acc;

    return {
      ...acc,
      [key]: editingStoryProp,
    };
  }, savedStoryProps);

  const onSave = React.useCallback(() => {
    const { secondsPerRound } = inputStoryPropsValues;

    if (!storyPropsRef || !secondsPerRound) {
      return;
    }

    dispatchEditingStoryProps({ type: "RESET" });

    const storyProps: DatabaseStoryProps = {
      storyId,
      storyPropsVersion: 1,
      storyPropsDateCreated: new Date().toISOString(),
      storyPropsDateModified: new Date().toISOString(),
      ...inputStoryPropsValues,
      secondsPerRound,
    };

    // TODO: Should we optimistically set the data in redux as well?
    storyPropsRef.set(storyProps);
  }, [
    inputStoryPropsValues,
    storyPropsRef,
    storyId,
    dispatchEditingStoryProps,
  ]);

  let shouldShowHelperText = false;

  if (
    !inputStoryPropsValues.secondsPerRound ||
    inputStoryPropsValues.secondsPerRound > max ||
    inputStoryPropsValues.secondsPerRound < min
  ) {
    shouldShowHelperText = true;
  }

  const isSaveDisabled =
    shouldShowHelperText ||
    Object.keys(inputStoryPropsValues).every(
      (key) =>
        // @ts-ignore
        inputStoryPropsValues[key] === savedStoryProps[key]
    );

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
              inputStoryPropsValues.secondsPerRound === 0
                ? 0
                : inputStoryPropsValues.secondsPerRound || ""
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
          <div>
            <InputLabel shrink>Can users finish their round early</InputLabel>
            <FormControlLabel
              control={
                <Switch
                  checked={!!inputStoryPropsValues.canUsersEndRoundEarly}
                  onChange={onChangeCanUsersEndRoundEarly}
                />
              }
              label={inputStoryPropsValues.canUsersEndRoundEarly ? "Yes" : "No"}
            />
          </div>
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
      {storyType === "LIVE" && <StoryUsers storyId={storyId} />}
    </>
  );
}

export default React.memo(Story);
