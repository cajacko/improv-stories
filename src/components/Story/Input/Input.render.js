// @flow

import React from 'react';
import TextArea from '@cajacko/lib/components/Forms/TextArea';
import ListItem, { TEXT_TYPE } from '../ListItem/ListItem.render';
import { withConsumer } from '../../context/Story/Input';

/**
 * The story action component
 */
const Input = ({ value, setValue }) => (
  <ListItem name="Story.You">
    <TextArea value={value} onChange={setValue} autoFocus type={TEXT_TYPE} />
  </ListItem>
);

export default withConsumer(Input);
