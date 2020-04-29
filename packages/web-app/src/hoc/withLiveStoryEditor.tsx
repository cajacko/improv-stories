import React from "react";
import { v4 as uuid } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import ReduxTypes from "ReduxTypes";
import { User } from "../sharedTypes";
import { send, listen } from "../utils/socket";
import useStoryUsers from "../hooks/useStoryUsers";
import { useEntriesRef } from "../hooks/useStoryRef";
import { Session } from "../store/sessionsById/types";

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
  activeSession: Session | null;
  dispatch: Dispatch<ReduxTypes.Action>;
  currentlyEditingUser: User | null;
}

interface State {
  editingText: null | string;
  countDownTimer: number | null;
  storyIsActive: boolean;
  listenerKey: string;
  activeSession: Session | null;
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
      editingText: null,
      countDownTimer: null,
      storyIsActive: false,
      listenerKey: uuid(),
      activeSession: null,
    };

    interval: null | number = null;
    removeTextListener: null | RemoveListener = null;

    constructor(props: HocProps<P>) {
      super(props);

      this.state.activeSession = props.activeSession;
    }

    resetEditingText = () => {
      if (this.state.editingText) {
        this.setState({ editingText: null });
      }
    };

    setTimer = () => {
      this.interval = setInterval(() => {
        const { activeSession } = this.props;

        if (!activeSession) {
          this.resetEditingText();

          if (this.state.countDownTimer) {
            this.setState({ countDownTimer: null });
          }

          return;
        }

        if (activeSession.userId !== this.props.currentUserId) {
          this.resetEditingText();
        }

        const { dateWillFinish } = activeSession;

        const diff = new Date(dateWillFinish).getTime() - new Date().getTime();
        let seconds: number | null = Math.floor(diff / 1000);
        if (seconds < 0) seconds = null;

        if (this.state.countDownTimer === seconds) return;

        this.setState({
          countDownTimer: seconds,
        });
      }, 1000);
    };

    onTextChange = (
      value: string | React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
      let newText = typeof value === "string" ? value : value.target.value;

      this.setState({ editingText: newText });

      try {
        send({
          id: uuid(),
          createdAt: new Date().toISOString(),
          type: "SET_SESSION_TEXT",
          payload: {
            text: newText,
            storyId: this.props.storyId,
          },
        });
      } catch {}
    };

    componentDidMount() {
      this.setTimer();

      this.removeTextListener = listen(
        "SESSION_CHANGED",
        this.state.listenerKey,
        (message) => {
          if (message.type !== "SESSION_CHANGED") return;
          if (!this.props.activeSession) return;
          if (this.getCurrentUserCanEdit()) return;
          if (this.props.activeSession.id !== message.payload.id) return;
          if (message.payload.user.id === this.props.currentUserId) return;

          this.setState({
            editingText: null,
            activeSession: {
              ...message.payload,
              userId: message.payload.user.id,
            },
          });
        }
      );

      document.addEventListener(keyEvent, this.onKeyDown);
    }

    onKeyDown: (event: KeyboardEvent) => void = (event) => {
      if (!this.getCurrentUserCanEdit()) return;

      const key = event.key;

      let text = this.state.editingText || "";

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
      let finalText: string | null;

      const currentUserCanEdit = this.getCurrentUserCanEdit();

      if (currentUserCanEdit) {
        finalText = this.state.editingText;
      } else {
        finalText =
          this.state.activeSession && this.state.activeSession.finalEntry;
      }

      const newProps: InjectedLiveStoryEditorProps = {
        text: finalText || "",
        currentUserCanEdit,
        currentlyEditingUser: this.props.currentlyEditingUser,
        countDownTimer: this.props.activeSession && this.state.countDownTimer,
      };

      return <Component {...this.props.originalProps} {...newProps} />;
    }
  }

  const LiveStoryEditorWithHooks: React.ComponentType<P> = (props: P) => {
    const currentUserId = useSelector((state) => state.currentUser.id);
    const entriesRef = useEntriesRef(props.storyId);
    const onlineUsers = useStoryUsers(props.storyId);

    const activeSession = useSelector((state) => {
      const story = state.storiesById[props.storyId];

      if (!story) return null;

      const activeSessionId = story.activeSessionId;

      if (!activeSessionId) return null;

      return state.sessionsById[activeSessionId] || null;
    });

    const currentlyEditingUser = useSelector((state) => {
      if (!activeSession) return null;

      const user = state.usersById[activeSession.userId];

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
        activeSession={activeSession}
        dispatch={dispatch}
        currentlyEditingUser={currentlyEditingUser}
      />
    );
  };

  return LiveStoryEditorWithHooks;
}

export default withLiveStoryEditor;
