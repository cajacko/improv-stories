import React from "react";
import { InjectedStoryProps, StoryOwnProps } from "../components/Story/types";

function withStandardStoryEditor<P extends StoryOwnProps = StoryOwnProps>(
  Component: React.ComponentType<P & InjectedStoryProps>
): React.ComponentType<P> {
  return React.memo((props) => {
    const textAreaRef = React.useRef(null);

    return (
      <Component
        secondsLeftProps={null}
        canCurrentUserEdit={false}
        editingSession={null}
        editingUser={null}
        isCurrentUserEditing={false}
        isTextAreaFocussed={false}
        focusOnTextArea={() => {}}
        textAreaRef={textAreaRef}
        textAreaValue=""
        onTextAreaChange={() => {}}
        onTextAreaFocus={() => {}}
        onTextAreaBlur={() => {}}
        storyType="LIVE"
        {...props}
      />
    );
  });
}

export default withStandardStoryEditor;
