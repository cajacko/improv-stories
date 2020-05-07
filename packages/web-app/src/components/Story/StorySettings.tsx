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

function Story({ storyId, handleClose }: Props) {
  let storyProps = useSelector((state) =>
    selectors.storyPropsByStoryId.selectStoryProps(state, { storyId })
  );
  const currentStorySecondsPerTurn =
    // TODO: Default length should be shared between api and web-app
    (storyProps && storyProps.secondsPerRound) || 40;

  const classes = useStyles();
  const [secondsPerTurn, setSecondsPerTurn] = React.useState<number | null>(
    currentStorySecondsPerTurn
  );
  const savedStoryProps = useSelector((state) =>
    selectors.storyPropsByStoryId.selectStoryProps(state, { storyId })
  );
  const savedSecondsPerRound =
    (savedStoryProps && savedStoryProps.secondsPerRound) || null;

  const storyPropsRef = useStoryPropsRef(storyId);

  React.useEffect(() => {
    if (savedSecondsPerRound === null) return;
    setSecondsPerTurn(savedSecondsPerRound);
  }, [savedSecondsPerRound]);

  const onChangeSecondsPerTurn = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value === "") {
        setSecondsPerTurn(null);
        return;
      }

      const value = parseInt(event.target.value, 10);
      setSecondsPerTurn(value);
    },
    []
  );

  const onSave = React.useCallback(() => {
    if (!storyPropsRef || secondsPerTurn === null) return;

    const storyProps: DatabaseStoryProps = {
      storyId,
      secondsPerRound: secondsPerTurn,
      storyPropsVersion: 1,
      storyPropsDateCreated: new Date().toISOString(),
      storyPropsDateModified: new Date().toISOString(),
    };

    // TODO: Should we optimistically set the data in redux as well?
    storyPropsRef.set(storyProps);
  }, [secondsPerTurn, storyPropsRef, storyId]);

  let shouldShowHelperText = false;

  if (secondsPerTurn === null || secondsPerTurn > max || secondsPerTurn < min) {
    shouldShowHelperText = true;
  }

  const isSaveDisabled =
    currentStorySecondsPerTurn === secondsPerTurn || shouldShowHelperText;

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
            value={secondsPerTurn === null ? "" : secondsPerTurn}
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
