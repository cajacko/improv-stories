import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { v4 as uuid } from "uuid";
import { Link as RRLink } from "react-router-dom";
import actions from "../store/actions";
import { send } from "../utils/socket";
import { fade, makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Link from "@material-ui/core/Link";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import SaveIcon from "@material-ui/icons/Save";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import getZIndex from "../utils/getZIndex";
import selectors from "../store/selectors";
import NewStoryButton from "./NewStoryButton";

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(2),
  },
  appBar: {
    position: "relative",
    zIndex: getZIndex("TOOLBAR"),
  },
  title: {
    display: "inline-block",
    cursor: "pointer",
    color: theme.palette.common.white,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "flex",
    },
  },
  subTitle: {
    marginLeft: theme.spacing(2),
    marginTop: 4,
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
    zIndex: getZIndex("TOOLBAR_SEARCH"),
  },
  inputRoot: {
    color: "inherit",
    position: "relative",
    zIndex: getZIndex("TOOLBAR_INPUT"),
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

interface Props {
  subTitle?: string;
}

function ToolBar({ subTitle }: Props) {
  const currentUser = useSelector(selectors.currentUser.selectCurrentUser);
  const currentUserId = currentUser.id;
  const dispatch = useDispatch();
  const [value, setValue] = React.useState(currentUser.name);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const canSave =
    value && !!value.length && !!currentUserId && value !== currentUser.name;

  const classes = useStyles();

  const onSetValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const saveName = (event: React.FormEvent | React.ChangeEvent) => {
    event.preventDefault();

    if (!canSave || !value || !currentUserId) return;

    if (inputRef && inputRef.current) {
      inputRef.current.blur();
    }

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

  return (
    <AppBar className={classes.appBar}>
      <Toolbar>
        <div className={classes.menuButton}>
          <NewStoryButton />
        </div>
        <div className={classes.titleContainer}>
          <Link
            className={classes.title}
            variant="h6"
            noWrap
            to="/"
            component={RRLink}
          >
            Improv Stories
          </Link>
          {!!subTitle && (
            <Typography className={classes.subTitle} component="span">
              {subTitle}
            </Typography>
          )}
        </div>

        <form className={classes.search} onSubmit={saveName}>
          <InputBase
            inputRef={inputRef}
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
          <IconButton
            className={classes.searchIcon}
            color={canSave ? "default" : "primary"}
            onClick={saveName}
          >
            <SaveIcon />
          </IconButton>
        </form>
      </Toolbar>
    </AppBar>
  );
}

export default React.memo(ToolBar);
