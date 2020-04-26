import React from "react";
import { v4 as uuid } from "uuid";
import { User } from "../store/usersById/types";
import { send, listen } from "../utils/socket";
import useCurrentUserId from "../hooks/useCurrentUserId";
import { useEntriesRef } from "../hooks/useStoryRef";
import { Entry } from "../store/entriesById/types";

const timePerEntry = 20;

export interface InjectedLiveStoryEditorProps {
  text: string;
  onTextChange: (
    value: string | React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;
  currentUserCanEdit: boolean;
  currentlyEditingUser: User | null;
  countDownTimer: number;
}

interface InjectedHookProps {
  currentUserId: ReturnType<typeof useCurrentUserId>;
  entriesRef: ReturnType<typeof useEntriesRef>;
  storyId: string;
}

interface State {
  text: null | string;
  countDownTimer: number;
}

interface OwnProps {
  storyId: string;
}

type RemoveListener = () => void;

function withLiveStoryEditor<P extends OwnProps = OwnProps>(
  Component: React.ComponentType<P & InjectedLiveStoryEditorProps>
): React.ComponentType<P> {
  class LiveStoryEditorHoc extends React.Component<
    InjectedHookProps & { originalProps: P },
    State
  > {
    state: State = {
      text: null,
      countDownTimer: timePerEntry,
    };

    interval: null | number = null;
    removeTextListener: null | RemoveListener = null;

    setTimer = () => {
      this.interval = setInterval(() => {
        let newTime = this.state.countDownTimer - 1;

        if (newTime < 0) {
          newTime = timePerEntry;
          this.onSave();
        }

        this.setState({
          countDownTimer: newTime,
        });
      }, 1000);
    };

    onSave = () => {
      if (!this.props.entriesRef) return;
      if (!this.state.text) return;
      // TODO: Remove later, wouldn't want this condition
      if (this.state.text === "") return;

      const entry: Entry = {
        id: uuid(),
        dateFinished: new Date().toISOString(),
        dateStarted: new Date().toISOString(),
        finalText: this.state.text,
        parts: [this.state.text],
      };

      this.props.entriesRef.push(entry);

      this.onTextChange("");
    };

    onTextChange = (
      value: string | React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
      let newText = typeof value === "string" ? value : value.target.value;

      this.setState({ text: newText });

      try {
        if (!this.props.storyId) return;

        send({
          id: uuid(),
          createdAt: new Date().toISOString(),
          type: "BROADCAST_TO_GROUPS",
          payload: {
            broadcastGroupIds: [this.props.storyId],
            payload: {
              id: uuid(),
              createdAt: new Date().toISOString(),
              type: "SET_STORY_CONTENT",
              payload: {
                content: newText,
              },
            },
          },
        });
      } catch {}
    };

    componentDidMount() {
      this.setTimer();

      this.removeTextListener = listen("SET_STORY_CONTENT", (message) => {
        if (message.type !== "SET_STORY_CONTENT") return;

        this.setState({
          text: message.payload.content,
        });
      });
    }

    componentWillUnmount() {
      if (this.interval) {
        clearInterval(this.interval);
      }

      if (this.removeTextListener) {
        this.removeTextListener();
      }
    }

    render() {
      const currentlyEditingUser: User | null = {
        id: "wooo",
        name: "Charlie",
      };

      const currentUserCanEdit =
        currentlyEditingUser.id === this.props.currentUserId;

      const finalText = this.state.text || "";

      const newProps: InjectedLiveStoryEditorProps = {
        text: finalText,
        onTextChange: this.onTextChange,
        currentUserCanEdit,
        currentlyEditingUser,
        countDownTimer: this.state.countDownTimer,
      };

      return <Component {...this.props.originalProps} {...newProps} />;
    }
  }

  const LiveStoryEditorWithHooks: React.ComponentType<P> = (props: P) => {
    const currentUserId = useCurrentUserId();
    const entriesRef = useEntriesRef(props.storyId);

    return (
      <LiveStoryEditorHoc
        originalProps={props}
        currentUserId={currentUserId}
        entriesRef={entriesRef}
        storyId={props.storyId}
      />
    );
  };

  return LiveStoryEditorWithHooks;
}

export default withLiveStoryEditor;
