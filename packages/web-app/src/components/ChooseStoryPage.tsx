import React from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import ChooseStoryType from "./ChooseStoryType";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      display: "flex",
      padding: 20,
      flexDirection: "column",
    },
    text: {
      maxWidth: 500,
      textAlign: "center",
      marginBottom: 50,
    },
  })
);

export function ChooseStoryPage() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography className={classes.text}>
        Welcome to Improv Stories! A way of writing weird, wonderful and
        improvised stories with others. To get started choose how you want to
        write your story:
      </Typography>
      <ChooseStoryType />
    </div>
  );
}

export default ChooseStoryPage;
