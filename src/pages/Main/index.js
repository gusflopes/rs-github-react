import React from 'react';

import { Title } from './styles';

export default function Main() {
  return (
    <>
      <Title error>
        Main <small>menor</small>
      </Title>

      <Title error={false}>
        Main <small>menor</small>
      </Title>
    </>
  );
}
