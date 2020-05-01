import React from "react";
import clsx from "clsx";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";

export const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginRight: -drawerWidth,
      position: "relative",
    },
    contentShift: {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 0,
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
    container: {
      display: "flex",
      flex: 1,
      flexDirection: "row",
      overflow: "hidden",
    },
  })
);

export interface RenderProps {
  isOpen: boolean;
  handleClose: () => void;
  handleOpen: () => void;
  toggleIsOpen: (isOpen: boolean) => void;
}

type RenderFunction = (props: RenderProps) => JSX.Element;

interface Props {
  renderMainContent: RenderFunction | JSX.Element;
  renderDrawerContent: RenderFunction | JSX.Element;
}

function StoryLayout({ renderMainContent, renderDrawerContent }: Props) {
  const classes = useStyles();

  const [isOpen, setIsOpen] = React.useState(true);

  const handleClose = React.useCallback(() => setIsOpen(false), [setIsOpen]);
  const handleOpen = React.useCallback(() => setIsOpen(true), [setIsOpen]);
  const toggleIsOpen = React.useCallback(() => setIsOpen(!isOpen), [
    setIsOpen,
    isOpen,
  ]);

  const renderProps: RenderProps = {
    isOpen,
    handleClose,
    handleOpen,
    toggleIsOpen,
  };

  return (
    <div className={classes.container}>
      <div
        className={clsx(classes.content, {
          [classes.contentShift]: isOpen,
        })}
      >
        {typeof renderMainContent === "function"
          ? renderMainContent(renderProps)
          : renderMainContent}
      </div>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="right"
        open={isOpen}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        {typeof renderDrawerContent === "function"
          ? renderDrawerContent(renderProps)
          : renderDrawerContent}
      </Drawer>
    </div>
  );
}

export default React.memo(StoryLayout);
