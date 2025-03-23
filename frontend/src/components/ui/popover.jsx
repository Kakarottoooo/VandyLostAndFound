import {
  Popover as ChakraPopover,
  PopoverContent as ChakraPopoverContent,
  PopoverArrow as ChakraPopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverTrigger,
  PopoverAnchor,
  Portal,
} from '@chakra-ui/react';
import * as React from 'react';

export const PopoverContent = React.forwardRef(function PopoverContent(props, ref) {
  const { portalled = true, portalRef, ...rest } = props;
  const content = <ChakraPopoverContent ref={ref} {...rest} />;
  return portalled ? <Portal containerRef={portalRef}>{content}</Portal> : content;
});

export const PopoverArrow = React.forwardRef(function PopoverArrow(props, ref) {
  return <ChakraPopoverArrow {...props} ref={ref} />;
});

export const PopoverCloseTrigger = React.forwardRef(function PopoverCloseTrigger(props, ref) {
  return (
    <PopoverCloseButton
      position="absolute"
      top="1"
      right="1"
      size="sm"
      ref={ref}
      {...props}
    />
  );
});

// Direct exports from ChakraPopover
export const PopoverRoot = ChakraPopover;
export const PopoverTitle = PopoverHeader;
export const PopoverDescription = PopoverBody;
export const PopoverHeaderExport = PopoverHeader; // Optional duplicate export if needed
export const PopoverFooterExport = PopoverFooter; // Optional duplicate export if needed
export const PopoverTriggerExport = PopoverTrigger;
export const PopoverBodyExport = PopoverBody;
export const PopoverAnchorExport = PopoverAnchor;
