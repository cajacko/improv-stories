import React from "react";
import { useSelector } from "react-redux";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import PersonIcon from "@material-ui/icons/Person";
import Badge from "@material-ui/core/Badge";
import selectors from "../store/selectors";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    listItem: {
      cursor: "inherit",
      "&:hover": {
        backgroundColor: "inherit",
      },
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
      textAlign: "right",
      marginRight: theme.spacing(1),
    },
  })
);

function ConnectedUsers({
  storyId,
  handleClose,
}: {
  storyId: string;
  handleClose?: () => void;
}) {
  const activeStoryUsers =
    useSelector(selectors.misc.selectActiveStoryUsers(storyId)) || [];

  const nonActiveStoryUsers =
    useSelector(selectors.misc.selectNonActiveStoryUsers(storyId)) || [];

  const currentlyEditingUser = useSelector(
    selectors.misc.selectActiveStorySessionUser(storyId)
  );

  const currentUserId = useSelector(selectors.currentUser.selectCurrentUser).id;

  const currentlyEditingUserId =
    currentlyEditingUser && currentlyEditingUser.id;

  const classes = useStyles();

  const renderListItem = (text: string) => (
    <ListItem button className={classes.listItem}>
      <ListItemText primary={text} />
    </ListItem>
  );

  return (
    <>
      <div className={classes.drawerHeader}>
        {!!handleClose && (
          <IconButton onClick={handleClose}>
            <ChevronRightIcon />
          </IconButton>
        )}
        <ListItemText primary="Editing Users" className={classes.headerText} />
      </div>
      <Divider />

      <List>
        {!activeStoryUsers.length && renderListItem("No one is editing")}
        {activeStoryUsers.map(({ name, id }) => (
          <ListItem button key={id} className={classes.listItem}>
            <ListItemIcon>
              <Badge
                variant="dot"
                color={currentlyEditingUserId === id ? "secondary" : undefined}
              >
                <PersonIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText
              primary={currentUserId === id ? "You" : name || "Anonymous"}
            />
          </ListItem>
        ))}
      </List>

      <Divider />
      {renderListItem("Observing users")}
      <Divider />
      <List>
        {!nonActiveStoryUsers.length && renderListItem("No one is watching")}
        {nonActiveStoryUsers.map(({ name, id }) => (
          <ListItem button key={id} className={classes.listItem}>
            <ListItemIcon>
              <Badge
                variant="dot"
                color={currentlyEditingUserId === id ? "secondary" : undefined}
              >
                <PersonIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText
              primary={currentUserId === id ? "You" : name || "Anonymous"}
            />
          </ListItem>
        ))}
      </List>
    </>
  );
}

export default React.memo(ConnectedUsers);
