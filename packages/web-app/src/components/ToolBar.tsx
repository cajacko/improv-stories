import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { v4 as uuid } from "uuid";
import actions from "../store/actions";
import { send } from "../utils/socket";
import { fade, makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/FiberNew";
import SaveIcon from "@material-ui/icons/Save";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "relative",
  },
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    top: 0,
    right: 0,
    zIndex: 2,
  },
  inputRoot: {
    color: "inherit",
    position: "relative",
    zIndex: 1,
  },
  inputInput: {
    padding: theme.spacing(1, 0, 1, 1),
    // vertical padding + font size from searchIcon
    paddingRight: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

function ToolBar() {
  const currentUser = useSelector((state) => state.currentUser);
  const currentUserId = currentUser.id;
  const dispatch = useDispatch();
  const [value, setValue] = React.useState(currentUser.name);
  const { push } = useHistory();
  const classes = useStyles();

  const canSave = value && !!value.length && !!currentUserId;

  const onSetValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const saveName = (event: React.FormEvent | React.ChangeEvent) => {
    event.preventDefault();

    if (!canSave || !value || !currentUserId) return;

    dispatch(
      actions.currentUser.setCurrentUserName({
        name: value,
        userId: currentUserId,
        date: new Date().toISOString(),
      })
    );

    send({
      id: uuid(),
      type: "SET_USER_DETAILS",
      createdAt: new Date().toISOString(),
      payload: {
        userDetails: {
          name: value,
        },
      },
    });
  };

  const onNewStoryClick = React.useCallback(() => push(`/story/${uuid()}`), [
    push,
  ]);

  return (
    <AppBar className={classes.appBar}>
      <Toolbar>
        <IconButton
          edge="start"
          className={classes.menuButton}
          color="inherit"
          aria-label="open drawer"
          onClick={onNewStoryClick}
        >
          <AddIcon />
        </IconButton>
        <Typography className={classes.title} variant="h6" noWrap>
          Improv Stories
        </Typography>
        <form className={classes.search} onSubmit={saveName}>
          <InputBase
            disabled={!currentUserId}
            onChange={onSetValue}
            placeholder="Your name"
            value={value || ""}
            classes={{
              root: classes.inputRoot,
              input: classes.inputInput,
            }}
            inputProps={{ "aria-label": "search" }}
          />
          <IconButton className={classes.searchIcon} onClick={saveName}>
            <SaveIcon />
          </IconButton>
        </form>
      </Toolbar>
    </AppBar>
  );
}

export default ToolBar;
