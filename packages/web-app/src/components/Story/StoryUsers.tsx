import React from "react";
import { useSelector } from "react-redux";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import PersonIcon from "@material-ui/icons/Person";
import Badge from "@material-ui/core/Badge";
import selectors from "../../store/selectors";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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

function StoryUsers({ storyId }: { storyId: string }) {
  const activeStoryUsers =
    useSelector((state) =>
      selectors.misc.selectStoryUsers(state, {
        storyId,
        storyUserType: "ACTIVE",
      })
    ) || [];

  const nonActiveStoryUsers =
    useSelector((state) =>
      selectors.misc.selectStoryUsers(state, {
        storyId,
        storyUserType: "NON_ACTIVE",
      })
    ) || [];

  const currentlyEditingUser = useSelector((state) =>
    selectors.misc.selectActiveStorySessionUser(state, { storyId })
  );

  const currentUserId = useSelector(selectors.currentUser.selectCurrentUser).id;

  const currentlyEditingUserId =
    currentlyEditingUser && currentlyEditingUser.id;

  const classes = useStyles();

  const renderListItem = (text: string) => (
    <ListItem>
      <ListItemText primary={text} />
    </ListItem>
  );

  return (
    <>
      <List>
        <ListItem>
          <ListItemText
            className={classes.headerText}
            primary="Editing Users"
          />
        </ListItem>
        {!activeStoryUsers.length && renderListItem("No one is editing")}
        {activeStoryUsers.map(({ name, id }) => (
          <ListItem key={id}>
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

      <List>
        <ListItem>
          <ListItemText
            className={classes.headerText}
            primary="Observing Users"
          />
        </ListItem>
        {!nonActiveStoryUsers.length && renderListItem("No one is watching")}
        {nonActiveStoryUsers.map(({ name, id }) => (
          <ListItem key={id}>
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

export default React.memo(StoryUsers);
