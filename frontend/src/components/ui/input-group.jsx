import {
  InputGroup as ChakraInputGroup,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';
import * as React from 'react';

export const InputGroup = React.forwardRef(function InputGroup(props, ref) {
  const {
    startElement,
    startElementProps,
    endElement,
    endElementProps,
    children,
    startOffset = '6px',
    endOffset = '6px',
    ...rest
  } = props;

  const child = React.Children.only(children);

  return (
    <ChakraInputGroup ref={ref} {...rest}>
      {startElement && (
        <InputLeftElement pointerEvents="none" {...startElementProps}>
          {startElement}
        </InputLeftElement>
      )}
      {React.cloneElement(child, {
        // Using padding-left (pl) and padding-right (pr); you can also use logical props if desired.
        ...(startElement && {
          pl: `calc(var(--input-height) - ${startOffset})`,
        }),
        ...(endElement && {
          pr: `calc(var(--input-height) - ${endOffset})`,
        }),
        ...child.props,
      })}
      {endElement && (
        <InputRightElement {...endElementProps}>
          {endElement}
        </InputRightElement>
      )}
    </ChakraInputGroup>
  );
});
