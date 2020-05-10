import React from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import ChooseStoryType from "./ChooseStoryType";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      display: "flex",
    },
  })
);

export function ChooseStoryPage() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <ChooseStoryType />
    </div>
  );
}

export default ChooseStoryPage;
