import React from "react";
import { useSelector, useDispatch } from "react-redux";
import selectors from "../store/selectors";
import actions from "../store/actions";
import {
  StoryEditorProps,
  InjectedStoryProps,
  StoryOwnProps,
} from "../components/Story/types";
import useCanCurrentUserEditStory from "../hooks/useCanCurrentUserEditStory";

const playingIntervalMilliseconds = 100;

type InjectedHookProps = any;
type State = any;
type RemoveListener = any;
type HocProps<P> = any;

function withStoryEditor<P extends StoryOwnProps = StoryOwnProps>(
  Component: React.ComponentType<P & InjectedStoryProps>
): React.ComponentType<P> {
  class LiveStoryEditorHoc extends React.Component<HocProps<P>, State> {
    nullProps: StoryEditorProps;

    constructor(props: HocProps<P>) {
      super(props);

      this.nullProps = {
        playingSession: null,
      };

      this.state = {
        injectedLiveStoryEditorProps: this.getInjectedLiveStoryEditorProps(
          null,
          props,
          null
        ),
      };
    }

    getInjectedLiveStoryEditorProps = (
      text: string | null,
      props: HocProps<P>,
      state: State | null
    ): StoryEditorProps => {
      if (!props.activeSession) return this.nullProps;
      let activeSession = props.activeSession;
      if (activeSession.id !== props.activeSession.id)
        activeSession = props.activeSession;

      const isCurrentUserActiveSessionUser =
        activeSession.userId === props.currentUserId;

      let canCurrentUserEdit =
        !!props.activeSession &&
        !props.didCurrentUserEndCurrentSessionEarly &&
        isCurrentUserActiveSessionUser;

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

      return {
        playingSession,
      };
    };

    componentDidUpdate(prevProps: HocProps<P>) {
      const { playingSession } = this.state.injectedLiveStoryEditorProps;

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

      if (
        prevProps.activeSession &&
        prevProps.activeSession.userId === this.props.currentUserId
      ) {
        return;
      }
    }

    render() {
      return <Component {...this.props.originalProps} />;
    }
  }

  const StoryEditorWithHooks: React.ComponentType<P> = (props: P) => {
    const canCurrentUserEditStory = useCanCurrentUserEditStory(
      props.storyId,
      props.type
    );
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
        canCurrentUserEditStory={canCurrentUserEditStory}
        isCurrentUserLastActiveSessionUserForStory={
          isCurrentUserLastActiveSessionUserForStory
        }
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
