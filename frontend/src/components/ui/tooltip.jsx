// src/components/ui/tooltip.jsx
import { Tooltip as ChakraTooltip } from '@chakra-ui/react';
import * as React from 'react';

export const Tooltip = React.forwardRef(function Tooltip(props, ref) {
  const { showArrow, children, disabled, content, ...rest } = props;

  if (disabled) return children;

  return (
    <ChakraTooltip
      hasArrow={showArrow}
      label={content}
      ref={ref}
      {...rest}
    >
      {children}
    </ChakraTooltip>
  );
});
