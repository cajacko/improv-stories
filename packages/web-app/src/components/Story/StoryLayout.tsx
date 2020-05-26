import React from "react";
import clsx from "clsx";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import getZIndex from "../../utils/getZIndex";
import useCanCurrentUserEditStory from "../../hooks/useCanCurrentUserEditStory";

export const drawerWidth = 240;

const getDrawerOnTopBreakPoint = (theme: Theme) => theme.breakpoints.up("md");

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
      overflow: "hidden",
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
      zIndex: getZIndex("STORY_DRAWER"),
    },
  })
);

export interface RenderProps {
  isOpen: boolean;
  handleClose: () => void;
  handleOpen: () => void;
  toggleIsOpen: () => void;
  isWideScreen: boolean;
}

type RenderFunction = (props: RenderProps) => JSX.Element;

interface Props {
  renderMainContent: RenderFunction | JSX.Element;
  renderDrawerContent: RenderFunction | JSX.Element;
  storyId: string;
  storyType: "LIVE" | "STANDARD";
}

function StoryLayout({
  renderMainContent,
  renderDrawerContent,
  storyId,
  storyType,
}: Props) {
  const isWideScreen = useMediaQuery(getDrawerOnTopBreakPoint, {
    // Ensures the query runs on load
    noSsr: true,
  });
  const classes = useStyles();
  const canCurrentUserEditStory = useCanCurrentUserEditStory(
    storyId,
    storyType
  );

  const [isOpen, setIsOpen] = React.useState(isWideScreen);

  const handleClose = React.useCallback(() => setIsOpen(false), [setIsOpen]);
  const handleOpen = React.useCallback(() => setIsOpen(true), [setIsOpen]);
  const toggleIsOpen = React.useCallback(() => setIsOpen(!isOpen), [
    setIsOpen,
    isOpen,
  ]);

  React.useEffect(() => {
    if (!isWideScreen && isOpen && canCurrentUserEditStory) {
      handleClose();
    }
  }, [isWideScreen, isOpen, canCurrentUserEditStory, handleClose]);

  const renderProps: RenderProps = {
    isOpen,
    handleClose,
    handleOpen,
    toggleIsOpen,
    isWideScreen,
  };

  return (
    <div className={classes.container}>
      <div
        className={clsx(classes.content, {
          [classes.contentShift]: isOpen,
        })}
        onClick={!isWideScreen && isOpen ? handleClose : undefined}
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
