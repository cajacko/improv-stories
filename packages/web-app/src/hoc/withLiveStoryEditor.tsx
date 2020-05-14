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
import {
  StoryEditorProps,
  InjectedStoryProps,
  StoryOwnProps,
} from "../components/Story/types";

interface InjectedHookProps {
  currentUserId: string;
  entriesRef: ReturnType<typeof useEntriesRef>;
  storyId: string;
  activeStoryUsers: User[];
  activeSession: Session | null;
  dispatch: Dispatch<ReduxTypes.Action>;
  currentlyEditingUser: User | null;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  didCurrentUserEndCurrentSessionEarly: boolean;
}

interface State {
  listenerKey: string;
  injectedLiveStoryEditorProps: StoryEditorProps;
  isTextAreaFocussed: boolean;
}

type RemoveListener = () => void;

type HocProps<P> = InjectedHookProps & { originalProps: P };

function withLiveStoryEditor<P extends StoryOwnProps = StoryOwnProps>(
  Component: React.ComponentType<P & InjectedStoryProps>
): React.ComponentType<P> {
  class LiveStoryEditorHoc extends React.Component<HocProps<P>, State> {
    activeSession: Session | null;
    nullProps: StoryEditorProps;
    interval: null | number = null;
    removeTextListener: null | RemoveListener = null;

    constructor(props: HocProps<P>) {
      super(props);
      this.activeSession = props.activeSession;

      this.nullProps = {
        secondsLeftProps: null,
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
    ): StoryEditorProps => {
      if (!props.activeSession) return this.nullProps;
      let activeSession = this.activeSession || props.activeSession;
      if (activeSession.id !== props.activeSession.id)
        activeSession = props.activeSession;

      const dateStarted = new Date(activeSession.dateStarted).getTime();
      const dateWillFinish = new Date(activeSession.dateWillFinish).getTime();

      // FIXME: There's a bug where some users computer clocks are not accurate to our server so the
      // time they get is out. We need to get the current time from our server somehow?
      const now = new Date().getTime();
      const diff = dateWillFinish - now;
      let secondsLeft: number | null = Math.floor(diff / 1000);
      const totalSeconds = Math.ceil((dateWillFinish - dateStarted) / 1000);

      const isCurrentUserEditing = activeSession.userId === props.currentUserId;
      const canCurrentUserEdit =
        !props.didCurrentUserEndCurrentSessionEarly &&
        isCurrentUserEditing &&
        secondsLeft > 0 &&
        props.activeStoryUsers.some(({ id }) => id === props.currentUserId);

      let editingSession = activeSession;

      if (canCurrentUserEdit) {
        editingSession = {
          ...activeSession,
          finalEntry: text || "",
        };
      }

      return {
        secondsLeftProps: {
          secondsLeft,
          totalSeconds,
        },
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
      newInjectedLiveStoryEditorProps?: StoryEditorProps
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

    // Store this.session outside the component, like a store
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

      if (!editingSession || !canCurrentUserEdit) {
        this.blueTextArea();
        return;
      }

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

    blueTextArea = (props = this.props) => {
      if (props.textAreaRef.current) {
        props.textAreaRef.current.blur();
      }
    };

    focusOnTextArea = (props = this.props) => {
      if (props.textAreaRef.current) {
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
          textAreaRef={this.props.textAreaRef}
          textAreaValue={
            props.editingSession ? props.editingSession.finalEntry : ""
          }
          onTextAreaChange={this.onTextChange}
          onTextAreaFocus={this.onTextAreaFocus}
          onTextAreaBlur={this.onTextAreaBlur}
          storyType="LIVE"
          {...props}
        />
      );
    }
  }

  const LiveStoryEditorWithHooks: React.ComponentType<P> = (props: P) => {
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
    const currentUserId = useSelector((state) => state.currentUser.id);
    const entriesRef = useEntriesRef(props.storyId);
    const activeStoryUsers = useSelector((state) =>
      selectors.misc.selectStoryUsers(state, {
        storyId: props.storyId,
        storyUserType: "ACTIVE",
      })
    );
    const activeSession = useSelector((state) =>
      selectors.misc.selectActiveStorySession(state, props)
    );
    const currentlyEditingUser = useSelector((state) =>
      selectors.misc.selectActiveStorySessionUser(state, props)
    );
    const didCurrentUserEndCurrentSessionEarly = useSelector((state) =>
      activeSession
        ? selectors.didCurrentUserEndSessionEarlyBySessionId.selectDidCurrentUserEndSessionEarlyBySessionId(
            state,
            { sessionId: activeSession.id }
          )
        : false
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
        didCurrentUserEndCurrentSessionEarly={
          didCurrentUserEndCurrentSessionEarly
        }
      />
    );
  };

  return LiveStoryEditorWithHooks;
}

export default withLiveStoryEditor;
