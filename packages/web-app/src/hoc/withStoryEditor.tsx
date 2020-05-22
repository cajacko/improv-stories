import React from "react";
import { v4 as uuid } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import ReduxTypes from "ReduxTypes";
import { User } from "../sharedTypes";
import { send, listen } from "../utils/socket";
import { Session } from "../store/sessionsById/types";
import selectors from "../store/selectors";
import transformServerSessionToClientSession from "../utils/transformServerSessionToClientSession";
import actions from "../store/actions";
import {
  StoryEditorProps,
  InjectedStoryProps,
  StoryOwnProps,
} from "../components/Story/types";

const playingIntervalMilliseconds = 100;

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
  lastSession: Session | null;
  isLastSessionRevealed: boolean;
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
    intervalTimeout: number = 1000;
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
        playingSession: null,
      };

      this.state = {
        isTextAreaFocussed: false,
        injectedLiveStoryEditorProps: this.getInjectedLiveStoryEditorProps(
          null,
          props,
          null
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
      props: HocProps<P>,
      state: State | null
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
        !!props.activeSession &&
        !props.didCurrentUserEndCurrentSessionEarly &&
        isCurrentUserActiveSessionUser &&
        secondsLeft > 0;

      let playingSession: StoryEditorProps["playingSession"] | null = null;

      if (props.originalProps.type === "LIVE") {
        canCurrentUserEdit =
          canCurrentUserEdit && props.isCurrentUserActiveInStory;
      } else {
        playingSession =
          canCurrentUserEdit && state
            ? state.injectedLiveStoryEditorProps.playingSession
            : null;

        if (playingSession) {
          const nextEntryIndex = playingSession.currentEntryIndex + 1;

          const nextEntryText = playingSession.session.entries[nextEntryIndex];

          if (nextEntryText) {
            const showNetEntryAfterDate = new Date(
              playingSession.showedCurrentEntryAt
            );
            showNetEntryAfterDate.setMilliseconds(
              showNetEntryAfterDate.getMilliseconds() +
                playingIntervalMilliseconds
            );

            const now = new Date();

            if (now.getTime() > showNetEntryAfterDate.getTime()) {
              playingSession = {
                session: playingSession.session,
                currentEntryIndex: nextEntryIndex,
                showedCurrentEntryAt: now.toISOString(),
                currentEntryText: nextEntryText,
              };
            }
          } else {
            playingSession = null;
          }
        } else if (
          canCurrentUserEdit &&
          props.lastSession &&
          !props.isLastSessionRevealed
        ) {
          const currentEntryIndex = 0;
          const currentEntryText = props.lastSession.entries[currentEntryIndex];

          if (currentEntryText) {
            playingSession = {
              session: props.lastSession,
              currentEntryIndex,
              showedCurrentEntryAt: new Date().toISOString(),
              currentEntryText,
            };
          }
        }

        if (playingSession) canCurrentUserEdit = false;
      }

      let editingSession = activeSession;

      if (canCurrentUserEdit) {
        editingSession = {
          ...activeSession,
          finalEntry: text || "",
        };
      }

      if (!playingSession) {
        // Reset it back to the default
        this.setInterval();
      }

      return {
        playingSession,
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
      return this.getInjectedLiveStoryEditorProps(text, props, state);
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
        this.getInjectedLiveStoryEditorProps(newText, this.props, this.state)
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

    setInterval = (interval = 1000) => {
      if (interval === this.intervalTimeout) return;

      this.intervalTimeout = interval;

      this.interval = setInterval(
        this.setInjectedLiveStoryEditorPropsIfChanged,
        interval
      );
    };

    componentDidMount() {
      this.setInterval();

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

          this.activeSession = transformServerSessionToClientSession(
            message.payload
          );

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
          this.getInjectedLiveStoryEditorProps("", newProps, this.state)
        );
      } else {
        this.setInjectedLiveStoryEditorPropsIfChanged(newProps);
      }
    }

    componentDidUpdate(prevProps: HocProps<P>) {
      const {
        editingSession,
        canCurrentUserEdit,
        playingSession,
      } = this.state.injectedLiveStoryEditorProps;

      if (
        this.props.originalProps.type === "STANDARD" &&
        !this.props.isLastSessionRevealed &&
        playingSession
      ) {
        setInterval(playingIntervalMilliseconds);

        this.props.dispatch(
          actions.revealedSessionsBySessionId.setRevealedSessionBySessionId({
            sessionId: playingSession.session.id,
          })
        );
      }

      if (!editingSession || !canCurrentUserEdit) {
        this.blurTextArea();
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
        this.interval = null;
      }

      if (this.removeTextListener) {
        this.removeTextListener();
      }
    }

    blurTextArea = (props = this.props) => {
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

    onRequestTakeTurn: InjectedStoryProps["onRequestTakeTurn"] = (
      lastSession
    ) => {
      if (this.getRequestTurnState() !== "CAN_REQUEST_TURN") return;

      this.setState({
        requestTurnState: "REQUESTING",
      });

      send({
        type: "STANDARD_STORY_REQUEST_TAKE_TURN",
        id: uuid(),
        createdAt: new Date().toISOString(),
        payload: {
          storyId: this.props.storyId,
          lastSession,
        },
      });
    };

    getRequestTurnState = (
      props = this.props,
      state = this.state
    ): InjectedStoryProps["requestTurnState"] => {
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
    };

    render() {
      const props = this.getInjectedLiveStoryEditorPropsWithText();
      const requestTurnState = this.getRequestTurnState();

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
          onRequestTakeTurn={this.onRequestTakeTurn}
          requestTurnState={requestTurnState}
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
    const lastSession = useSelector((state) =>
      selectors.misc.selectLastStorySession(state, props)
    );

    const isLastSessionRevealed = useSelector((state) =>
      lastSession
        ? selectors.revealedSessionsBySessionId.selectIsSessionRevealed(state, {
            sessionId: lastSession.id,
          })
        : false
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
        lastSession={lastSession}
        dispatch={dispatch}
        currentlyEditingUser={currentlyEditingUser}
        didCurrentUserEndCurrentSessionEarly={
          didCurrentUserEndCurrentSessionEarly
        }
        isLastSessionRevealed={isLastSessionRevealed}
      />
    );
  };

  return StoryEditorWithHooks;
}

export default withStoryEditor;
