import React from "react";
import useStoryUsers from "../hooks/useStoryUsers";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import PersonIcon from "@material-ui/icons/Person";
import Badge from "@material-ui/core/Badge";
import { useSelector } from "react-redux";

export const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    listItem: {
      cursor: "inherit",
      "&:hover": {
        backgroundColor: "inherit",
      },
      textAlign: "right",
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
      position: "relative",
      zIndex: 1,
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
  isOpen,
  handleClose,
}: {
  storyId: string;
  isOpen: boolean;
  handleClose: () => void;
}) {
  const users = useStoryUsers(storyId);
  const classes = useStyles();

  const currentlyEditing = useSelector((state) => {
    const story = state.storiesById[storyId];

    if (!story) return null;

    return story.currentlyEditing;
  });

  const currentlyEditingUserId = useSelector((state) => {
    if (!currentlyEditing) return null;

    const user = state.usersById[currentlyEditing.userId];

    return user ? user.id : null;
  });

  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="right"
      open={isOpen}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.drawerHeader}>
        <IconButton onClick={handleClose}>
          <ChevronRightIcon />
        </IconButton>
        <ListItemText primary="Active users" className={classes.headerText} />
      </div>
      <Divider />
      <List>
        {users.map(({ name, id }) => (
          <ListItem button key={id} className={classes.listItem}>
            <ListItemIcon>
              <Badge
                variant="dot"
                color={currentlyEditingUserId === id ? "secondary" : undefined}
              >
                <PersonIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary={name || "Anonymous"} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default ConnectedUsers;
