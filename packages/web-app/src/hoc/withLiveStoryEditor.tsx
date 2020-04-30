import React from "react";
import { v4 as uuid } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import ReduxTypes from "ReduxTypes";
import { User } from "../sharedTypes";
import { send, listen } from "../utils/socket";
import { useEntriesRef } from "../hooks/useStoryRef";
import { Session } from "../store/sessionsById/types";
import selectors from "../store/selectors";
import convertServerSession from "../utils/convertServerSession";
import actions from "../store/actions";

const keyEvent = "keydown";

interface Generic<S = null, T = null, U = null, C = false, A = false> {
  editingSession: S;
  secondsLeft: T;
  editingUser: U;
  canCurrentUserEdit: C;
  isCurrentUserEditing: A;
}

export type InjectedLiveStoryEditorProps =
  | Generic<Session, number, User | null, boolean, boolean>
  | Generic;

interface InjectedHookProps {
  currentUserId: string;
  entriesRef: ReturnType<typeof useEntriesRef>;
  storyId: string;
  activeStoryUsers: User[];
  activeSession: Session | null;
  dispatch: Dispatch<ReduxTypes.Action>;
  currentlyEditingUser: User | null;
}

interface State {
  listenerKey: string;
  injectedLiveStoryEditorProps: InjectedLiveStoryEditorProps;
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
    activeSession: Session | null;
    nullProps: InjectedLiveStoryEditorProps;
    interval: null | number = null;
    removeTextListener: null | RemoveListener = null;

    constructor(props: HocProps<P>) {
      super(props);
      this.activeSession = props.activeSession;

      this.nullProps = {
        secondsLeft: null,
        canCurrentUserEdit: false,
        editingSession: null,
        editingUser: null,
        isCurrentUserEditing: false,
      };

      this.state = {
        injectedLiveStoryEditorProps: this.getInjectedLiveStoryEditorProps(
          null,
          props
        ),
        listenerKey: uuid(),
      };
    }

    getInjectedLiveStoryEditorProps = (
      text: string | null,
      props = this.props
    ): InjectedLiveStoryEditorProps => {
      if (!props.activeSession) return this.nullProps;
      let activeSession = this.activeSession || props.activeSession;
      if (activeSession.id !== props.activeSession.id)
        activeSession = props.activeSession;

      const dateWillFinish = new Date(activeSession.dateWillFinish).getTime();
      const now = new Date().getTime();
      const diff = dateWillFinish - now;
      let secondsLeft: number | null = Math.floor(diff / 1000);

      const isCurrentUserEditing = activeSession.userId === props.currentUserId;
      const canCurrentUserEdit = isCurrentUserEditing && secondsLeft > 0;

      let editingSession = activeSession;

      if (canCurrentUserEdit) {
        editingSession = {
          ...activeSession,
          finalEntry: text || "",
        };
      }

      return {
        secondsLeft,
        editingSession,
        editingUser: props.currentlyEditingUser,
        canCurrentUserEdit,
        isCurrentUserEditing,
      };
    };

    getActiveSessionFinalEntry = (state = this.state) => {
      const { editingSession } = state.injectedLiveStoryEditorProps;
      return editingSession && editingSession.finalEntry;
    };

    getInjectedLiveStoryEditorPropsWithText = (
      props = this.props,
      state = this.state
    ) => {
      const text = this.getActiveSessionFinalEntry(state);
      return this.getInjectedLiveStoryEditorProps(text, props);
    };

    setInjectedLiveStoryEditorPropsIfChanged = (
      props = this.props,
      state = this.state,
      newInjectedLiveStoryEditorProps?: InjectedLiveStoryEditorProps
    ) => {
      const newProps =
        newInjectedLiveStoryEditorProps ||
        this.getInjectedLiveStoryEditorPropsWithText(props, state);

      if (state.injectedLiveStoryEditorProps === newProps) return;

      this.setState({
        injectedLiveStoryEditorProps: newProps,
      });
    };

    onTextChange = (
      value: string | React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
      if (!this.state.injectedLiveStoryEditorProps.canCurrentUserEdit) return;

      let newText = typeof value === "string" ? value : value.target.value;

      this.setInjectedLiveStoryEditorPropsIfChanged(
        undefined,
        undefined,
        this.getInjectedLiveStoryEditorProps(newText)
      );

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
      this.interval = setInterval(
        this.setInjectedLiveStoryEditorPropsIfChanged,
        1000
      );

      this.removeTextListener = listen(
        "SESSION_CHANGED",
        this.state.listenerKey,
        (message) => {
          if (message.type !== "SESSION_CHANGED") return;

          if (
            !this.props.activeSession ||
            this.props.activeSession.id !== message.payload.id
          ) {
            this.activeSession = null;
            return;
          }

          this.activeSession = convertServerSession(message.payload);

          this.setInjectedLiveStoryEditorPropsIfChanged();
        }
      );

      document.addEventListener(keyEvent, this.onKeyDown);
    }

    componentWillReceiveProps(newProps: HocProps<P>) {
      const isNewSession =
        !this.activeSession ||
        !newProps.activeSession ||
        newProps.activeSession.id !== this.activeSession.id;

      if (isNewSession) {
        if (this.activeSession) {
          newProps.dispatch(
            actions.sessionsById.setSession(this.activeSession)
          );
        }

        this.activeSession = newProps.activeSession;

        this.setInjectedLiveStoryEditorPropsIfChanged(
          undefined,
          undefined,
          this.getInjectedLiveStoryEditorProps("", newProps)
        );
      } else {
        this.setInjectedLiveStoryEditorPropsIfChanged(newProps);
      }
    }

    onKeyDown: (event: KeyboardEvent) => void = (event) => {
      if (!this.state.injectedLiveStoryEditorProps.canCurrentUserEdit) return;

      const key = event.key;

      let text = this.getActiveSessionFinalEntry() || "";

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

    render() {
      const props = this.getInjectedLiveStoryEditorPropsWithText();

      return <Component {...this.props.originalProps} {...props} />;
    }
  }

  const LiveStoryEditorWithHooks: React.ComponentType<P> = (props: P) => {
    const currentUserId = useSelector((state) => state.currentUser.id);
    const entriesRef = useEntriesRef(props.storyId);
    const activeStoryUsers = useSelector(
      selectors.misc.selectActiveStoryUsers(props.storyId)
    );
    const activeSession = useSelector(
      selectors.misc.selectActiveStorySession(props.storyId)
    );
    const currentlyEditingUser = useSelector(
      selectors.misc.selectActiveStorySessionUser(props.storyId)
    );

    const dispatch = useDispatch();

    return (
      <LiveStoryEditorHoc
        originalProps={props}
        currentUserId={currentUserId}
        entriesRef={entriesRef}
        storyId={props.storyId}
        activeStoryUsers={activeStoryUsers || []}
        activeSession={activeSession}
        dispatch={dispatch}
        currentlyEditingUser={currentlyEditingUser}
      />
    );
  };

  return LiveStoryEditorWithHooks;
}

export default withLiveStoryEditor;
