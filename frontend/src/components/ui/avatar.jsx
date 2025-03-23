'use client'

import {
  Avatar as ChakraAvatar,
  AvatarImage,
  AvatarFallback as ChakraAvatarFallback,
  AvatarGroup as ChakraAvatarGroup,
} from '@chakra-ui/react';
import * as React from 'react';

export const Avatar = React.forwardRef(function Avatar(props, ref) {
  const { name, src, srcSet, loading, icon, fallback, children, ...rest } = props;
  return (
    <ChakraAvatar ref={ref} name={name} src={src} srcSet={srcSet} loading={loading} {...rest}>
      {/* You don't need AvatarImage here, ChakraAvatar already renders it */}
      {fallback && <ChakraAvatarFallback>{fallback}</ChakraAvatarFallback>}
      {children}
    </ChakraAvatar>
  );
});

function getInitials(name) {
  const names = name.trim().split(' ');
  const firstName = names[0] ?? '';
  const lastName = names.length > 1 ? names[names.length - 1] : '';
  return firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`
    : firstName.charAt(0);
}

export const AvatarGroup = React.forwardRef(function AvatarGroup(props, ref) {
  return <ChakraAvatarGroup ref={ref} {...props} />;
});
