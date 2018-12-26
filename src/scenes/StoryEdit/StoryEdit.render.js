// @flow

import React from 'react';
import styled from 'styled-components';
import HeaderWithContent from '@cajacko/lib/components/Layout/HeaderWithContent';
import TextInputGroup from '@cajacko/lib/components/Forms/Groups/TextInput';
import Button from '@cajacko/lib/components/Button';
import { Div } from '@cajacko/lib/components/UI';
import buttons from '@cajacko/lib/config/styles/buttons';

const Container = styled(Div)`
  flex: 1;
  align-items: center;
`;

/**
 * Add/edit a story
 */
const StoryEdit = ({
  save, title, onChange, error, back, isNew,
}) => (
  <HeaderWithContent
    hasPadding
    header={{
      title: isNew ? 'EditStory.Title.Add' : 'EditStory.Title.Edit',
      cancel: isNew ? back : undefined,
      back: isNew ? undefined : back,
    }}
  >
    <Container>
      <TextInputGroup
        label="EditStory.Label"
        error={error}
        value={title}
        onChangeText={onChange}
        paddingVertical
        onSubmit={save}
      />
      <Button text="EditStory.Button" type={buttons.CONTAINED} action={save} />
    </Container>
  </HeaderWithContent>
);

export default StoryEdit;
