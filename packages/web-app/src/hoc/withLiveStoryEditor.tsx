import React from "react";
import { v4 as uuid } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import ReduxTypes from "ReduxTypes";
import { User } from "../sharedTypes";
import { send, listen } from "../utils/socket";
import useStoryUsers from "../hooks/useStoryUsers";
import { useEntriesRef } from "../hooks/useStoryRef";
import { Entry } from "../store/entriesById/types";
import { CurrentlyEditing } from "../store/storiesById/types";

const keyEvent = "keydown";

export interface InjectedLiveStoryEditorProps {
  text: string;
  currentUserCanEdit: boolean;
  currentlyEditingUser: User | null;
  countDownTimer: number | null;
}

interface InjectedHookProps {
  currentUserId: string;
  entriesRef: ReturnType<typeof useEntriesRef>;
  storyId: string;
  onlineUsers: User[];
  currentlyEditing: CurrentlyEditing | null;
  dispatch: Dispatch<ReduxTypes.Action>;
  currentlyEditingUser: User | null;
}

interface State {
  text: null | string;
  countDownTimer: number | null;
  storyIsActive: boolean;
  listenerKey: string;
}

interface OwnProps {
  storyId: string;
}

type RemoveListener = () => void;

type HocProps<P> = InjectedHookProps & { originalProps: P };

function withLiveStoryEditor<P extends OwnProps = OwnProps>(
  Component: React.ComponentType<P & InjectedLiveStoryEditorProps>
): React.ComponentType<P> {
  class LiveStoryEditorHoc extends React.Component<HocProps<P>, State> {
    state: State = {
      text: null,
      countDownTimer: null,
      storyIsActive: false,
      listenerKey: uuid(),
    };

    interval: null | number = null;
    removeTextListener: null | RemoveListener = null;

    setTimer = () => {
      this.interval = setInterval(() => {
        const { currentlyEditing } = this.props;

        if (!currentlyEditing) {
          if (this.state.countDownTimer) {
            this.setState({ countDownTimer: null });
          }

          return;
        }

        const { willFinishDate } = currentlyEditing;

        const diff = new Date(willFinishDate).getTime() - new Date().getTime();
        let seconds: number | null = Math.floor(diff / 1000);
        if (seconds < 0) seconds = null;

        if (this.state.countDownTimer === seconds) return;

        this.setState({
          countDownTimer: seconds,
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
          type: "ADD_STORY_ENTRY",
          payload: {
            entry: newText,
            storyId: this.props.storyId,
          },
        });
      } catch {}
    };

    componentDidMount() {
      this.setTimer();

      this.removeTextListener = listen(
        "STORY_CHANGED",
        this.state.listenerKey,
        (message) => {
          if (message.type !== "STORY_CHANGED") return;
          if (!message.payload.activeSession) return;

          this.setState({
            text: message.payload.activeSession.finalEntry,
          });
        }
      );

      document.addEventListener(keyEvent, this.onKeyDown);
    }

    onKeyDown: (event: KeyboardEvent) => void = (event) => {
      if (!this.getCurrentUserCanEdit()) return;

      const key = event.key;

      let text = this.state.text || "";

      switch (key) {
        case "Backspace":
          text = text.slice(0, -1);
          break;
        case "Enter":
          text = `${text}\n`;
          break;
        default:
          if (key.length > 1) return;
          text = `${text}${key}`;
          break;
      }

      this.onTextChange(text);
    };

    componentWillUnmount() {
      if (this.interval) {
        clearInterval(this.interval);
      }

      if (this.removeTextListener) {
        this.removeTextListener();
      }

      document.removeEventListener(keyEvent, this.onKeyDown);
    }

    static getDerivedStateFromProps(props: HocProps<P>): Partial<State> {
      return {
        storyIsActive: !!props.currentlyEditingUser,
      };
    }

    getCurrentUserCanEdit = (props = this.props) => {
      return (
        this.state.storyIsActive &&
        !!props.currentlyEditingUser &&
        props.currentlyEditingUser.id === props.currentUserId
      );
    };

    render() {
      const finalText = this.state.text || "";

      const newProps: InjectedLiveStoryEditorProps = {
        text: finalText,
        currentUserCanEdit: this.getCurrentUserCanEdit(),
        currentlyEditingUser: this.props.currentlyEditingUser,
        countDownTimer:
          this.props.currentlyEditing && this.state.countDownTimer,
      };

      return <Component {...this.props.originalProps} {...newProps} />;
    }
  }

  const LiveStoryEditorWithHooks: React.ComponentType<P> = (props: P) => {
    const currentUserId = useSelector((state) => state.currentUser.id);
    const entriesRef = useEntriesRef(props.storyId);
    const onlineUsers = useStoryUsers(props.storyId);

    const currentlyEditing = useSelector((state) => {
      const story = state.storiesById[props.storyId];

      if (!story) return null;

      return story.currentlyEditing;
    });

    const currentlyEditingUser = useSelector((state) => {
      if (!currentlyEditing) return null;

      const user = state.usersById[currentlyEditing.userId];

      return user || null;
    });

    const dispatch = useDispatch();

    return (
      <LiveStoryEditorHoc
        originalProps={props}
        currentUserId={currentUserId}
        entriesRef={entriesRef}
        storyId={props.storyId}
        onlineUsers={onlineUsers}
        currentlyEditing={currentlyEditing}
        dispatch={dispatch}
        currentlyEditingUser={currentlyEditingUser}
      />
    );
  };

  return LiveStoryEditorWithHooks;
}

export default withLiveStoryEditor;
