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
 * The profile scene, let the user change their name
 */
const Profile = ({
  save, name, onChange, error, back,
}) => (
  <HeaderWithContent hasPadding header={{ title: 'Profile.Title', back }}>
    <Container>
      <TextInputGroup
        label="Profile.Label"
        error={error}
        value={name}
        onChangeText={onChange}
        paddingVertical
        onSubmit={save}
      />
      <Button text="Profile.Button" type={buttons.CONTAINED} action={save} />
    </Container>
  </HeaderWithContent>
);

export default Profile;
