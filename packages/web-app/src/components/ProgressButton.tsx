import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    activeButtonWrapper: {
      position: "relative",
      display: "block",
    },
    buttonProgress: {
      position: "absolute",
      top: "50%",
      left: "50%",
      marginTop: -12,
      marginLeft: -12,
    },
  })
);

function ProgressButton({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: JSX.Element;
}) {
  const classes = useStyles();

  return (
    <div className={classes.activeButtonWrapper}>
      {children}
      {isLoading && (
        <CircularProgress size={24} className={classes.buttonProgress} />
      )}
    </div>
  );
}

export default ProgressButton;
