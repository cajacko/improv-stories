import React from "react";
import { v4 as uuid } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import ReduxTypes from "ReduxTypes";
import { User } from "../sharedTypes";
import { send, listen } from "../utils/socket";
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
  storyId: string;
  isCurrentUserActiveInStory: boolean;
  activeSession: Session | null;
  dispatch: Dispatch<ReduxTypes.Action>;
  currentlyEditingUser: User | null;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  didCurrentUserEndCurrentSessionEarly: boolean;
  isCurrentUserLastActiveSessionUserForStory: boolean;
}

interface State {
  listenerKey: string;
  injectedLiveStoryEditorProps: StoryEditorProps;
  isTextAreaFocussed: boolean;
  requestTurnState: InjectedStoryProps["requestTurnState"];
}

type RemoveListener = () => void;

type HocProps<P> = InjectedHookProps & { originalProps: P };

function withStoryEditor<P extends StoryOwnProps = StoryOwnProps>(
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
        isCurrentUserActiveSessionUser: false,
      };

      this.state = {
        isTextAreaFocussed: false,
        injectedLiveStoryEditorProps: this.getInjectedLiveStoryEditorProps(
          null,
          props
        ),
        listenerKey: uuid(),
        // TODO: Should always default to cannot, this is temp
        requestTurnState:
          props.originalProps.type === "LIVE"
            ? "CANNOT_REQUEST_TURN"
            : "CAN_REQUEST_TURN",
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

      const isCurrentUserActiveSessionUser =
        activeSession.userId === props.currentUserId;

      let canCurrentUserEdit =
        !props.didCurrentUserEndCurrentSessionEarly &&
        isCurrentUserActiveSessionUser &&
        secondsLeft > 0;

      if (props.originalProps.type === "LIVE") {
        canCurrentUserEdit =
          canCurrentUserEdit && props.isCurrentUserActiveInStory;
      }

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
        isCurrentUserActiveSessionUser,
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
          type:
            this.props.originalProps.type === "LIVE"
              ? "LIVE_STORY_SET_SESSION_TEXT"
              : "STANDARD_STORY_SET_SESSION_TEXT",
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
        "LIVE_STORY_SESSION_CHANGED",
        this.state.listenerKey,
        (message) => {
          if (message.type !== "LIVE_STORY_SESSION_CHANGED") return;

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
        if (
          this.state.requestTurnState === "REQUESTING" &&
          newProps.originalProps.type === "STANDARD"
        ) {
          this.setState({ requestTurnState: "CAN_REQUEST_TURN" });
        }

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

    onRequestTakeTurn = (lastSession: Session | null) => {
      if (this.getRequestTurnState() !== "CAN_REQUEST_TURN") return;

      this.setState({
        requestTurnState: "REQUESTING",
      });

      send({
        type: "STANDARD_STORY_REQUEST_TAKE_TURN",
        id: uuid(),
        createdAt: new Date().toUTCString(),
        payload: {
          storyId: this.props.storyId,
          lastSession,
        },
      });
    };

    getRequestTurnState(
      props = this.props,
      state = this.state
    ): InjectedStoryProps["requestTurnState"] {
      if (props.originalProps.type === "LIVE") return "CANNOT_REQUEST_TURN";

      const injectedProps = this.getInjectedLiveStoryEditorPropsWithText(
        props,
        state
      );

      if (injectedProps.canCurrentUserEdit) return "CANNOT_REQUEST_TURN";

      if (injectedProps.isCurrentUserActiveSessionUser) {
        return "CANNOT_REQUEST_TURN";
      }

      if (props.isCurrentUserLastActiveSessionUserForStory) {
        return "CANNOT_REQUEST_TURN";
      }

      return state.requestTurnState;
    }

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
          onTakeTurnClick={
            this.getRequestTurnState() === "CAN_REQUEST_TURN"
              ? this.onRequestTakeTurn
              : undefined
          }
          requestTurnState={this.getRequestTurnState()}
          {...props}
        />
      );
    }
  }

  const StoryEditorWithHooks: React.ComponentType<P> = (props: P) => {
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
    const currentUserId = useSelector((state) => state.currentUser.id);
    const isCurrentUserActiveInStory = useSelector((state) =>
      selectors.misc.selectIsCurrentUserActiveInStory(state, {
        storyId: props.storyId,
      })
    );
    const activeSession = useSelector((state) =>
      selectors.misc.selectActiveStorySession(state, props)
    );
    const isCurrentUserLastActiveSessionUserForStory = useSelector((state) =>
      selectors.misc.selectIsCurrentUserLastActiveSessionUserForStory(
        state,
        props
      )
    );
    const currentlyEditingUser = useSelector((state) =>
      selectors.misc.selectCurrentlyEditingStoryUser(state, props)
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
        isCurrentUserLastActiveSessionUserForStory={
          isCurrentUserLastActiveSessionUserForStory
        }
        textAreaRef={textAreaRef}
        originalProps={props}
        currentUserId={currentUserId}
        storyId={props.storyId}
        isCurrentUserActiveInStory={isCurrentUserActiveInStory}
        activeSession={activeSession}
        dispatch={dispatch}
        currentlyEditingUser={currentlyEditingUser}
        didCurrentUserEndCurrentSessionEarly={
          didCurrentUserEndCurrentSessionEarly
        }
      />
    );
  };

  return StoryEditorWithHooks;
}

export default withStoryEditor;
