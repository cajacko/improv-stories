import React from "react";
import clsx from "clsx";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import useMediaQuery from "@material-ui/core/useMediaQuery";

export const drawerWidth = 240;

const getDrawerOnTopBreakPoint = (theme: Theme) => {
  const breakPoint = theme.breakpoints.up("md");
  console.log(breakPoint);

  return breakPoint;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flex: 1,
      flexDirection: "row",
      overflow: "hidden",
    },
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
      [getDrawerOnTopBreakPoint(theme)]: {
        transition: theme.transitions.create("margin", {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: 0,
      },
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
  const doesMatchBreakpoint = useMediaQuery(getDrawerOnTopBreakPoint, {
    noSsr: true,
  });
  const classes = useStyles();

  console.log("doesMatchBreakpoint", doesMatchBreakpoint);

  const [isOpen, setIsOpen] = React.useState(doesMatchBreakpoint);

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
