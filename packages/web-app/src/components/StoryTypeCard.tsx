import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles({
  root: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
  },
  content: {
    flex: 1,
  },
});

interface Props {
  title: string;
  description: string;
  onClick: () => void;
}

export function StoryTypeCard({ title, description, onClick }: Props) {
  const classes = useStyles();

  return (
    <Card className={classes.root} component="button" onClick={onClick}>
      <CardContent className={classes.content}>
        <Typography color="primary" variant="h5" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" component="p">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={onClick}>
          Create
        </Button>
      </CardActions>
    </Card>
  );
}

export default StoryTypeCard;
