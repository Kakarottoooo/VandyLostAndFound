// src/components/ui/slider.jsx
import {
  Slider as ChakraSlider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Text,
} from '@chakra-ui/react';
import React from 'react';

export const Slider = React.forwardRef(function Slider(props, ref) {
  const {
    label,
    showValue,
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    marks = [],
    ...rest
  } = props;

  return (
    <div>
      {label && (
        <Text mb={2}>
          {label}
          {showValue && `: ${value}`}
        </Text>
      )}
      <ChakraSlider
        ref={ref}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        {...rest}
      >
        {marks.map((mark) => (
          <SliderMark key={mark.value} value={mark.value} mt="1" fontSize="sm">
            {mark.label}
          </SliderMark>
        ))}
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </ChakraSlider>
    </div>
  );
});
