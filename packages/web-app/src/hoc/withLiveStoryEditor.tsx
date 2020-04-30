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

interface Generic<S = null, T = null, U = null, C = false, A = false> {
  editingSession: S;
  secondsLeft: T;
  editingUser: U;
  canCurrentUserEdit: C;
  isCurrentUserEditing: A;
}

export type EditorProps =
  | Generic<Session, number, User | null, boolean, boolean>
  | Generic;

export type InjectedLiveStoryEditorProps = EditorProps & {
  isTextAreaFocussed: boolean;
  focusOnTextArea: () => void;
  textAreaProps: {
    ref: React.RefObject<HTMLTextAreaElement>;
    onFocus: () => void;
    onBlur: () => void;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  };
};

interface InjectedHookProps {
  currentUserId: string;
  entriesRef: ReturnType<typeof useEntriesRef>;
  storyId: string;
  activeStoryUsers: User[];
  activeSession: Session | null;
  dispatch: Dispatch<ReduxTypes.Action>;
  currentlyEditingUser: User | null;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
}

interface State {
  listenerKey: string;
  injectedLiveStoryEditorProps: EditorProps;
  isTextAreaFocussed: boolean;
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
    nullProps: EditorProps;
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
        isTextAreaFocussed: false,
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
    ): EditorProps => {
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
      newInjectedLiveStoryEditorProps?: EditorProps
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

    componentDidUpdate(prevProps: HocProps<P>) {
      const {
        editingSession,
        canCurrentUserEdit,
      } = this.state.injectedLiveStoryEditorProps;

      if (!editingSession) return;
      if (!canCurrentUserEdit) return;
      if (
        prevProps.activeSession &&
        prevProps.activeSession.userId === this.props.currentUserId
      ) {
        return;
      }

      this.focusOnTextArea();
    }

    componentWillUnmount() {
      if (this.interval) {
        clearInterval(this.interval);
      }

      if (this.removeTextListener) {
        this.removeTextListener();
      }
    }

    focusOnTextArea = (props = this.props) => {
      if (props.textAreaRef.current) {
        console.log("focus on the textarea");
        props.textAreaRef.current.focus();
      }
    };

    onTextAreaFocus = () => {
      this.setState({ isTextAreaFocussed: true });
    };

    onTextAreaBlur = () => {
      this.setState({ isTextAreaFocussed: false });
    };

    render() {
      const props = this.getInjectedLiveStoryEditorPropsWithText();

      return (
        <Component
          {...this.props.originalProps}
          isTextAreaFocussed={this.state.isTextAreaFocussed}
          focusOnTextArea={this.focusOnTextArea}
          textAreaProps={{
            ref: this.props.textAreaRef,
            value: props.editingSession ? props.editingSession.finalEntry : "",
            onChange: this.onTextChange,
            onFocus: this.onTextAreaFocus,
            onBlur: this.onTextAreaBlur,
          }}
          {...props}
        />
      );
    }
  }

  const LiveStoryEditorWithHooks: React.ComponentType<P> = (props: P) => {
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
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
        textAreaRef={textAreaRef}
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
