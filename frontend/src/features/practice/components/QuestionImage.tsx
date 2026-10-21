import React from 'react';
import { ZoomableImage, type ZoomableImageProps } from '@/components/ui/ZoomableImage';

export type QuestionImageProps = ZoomableImageProps;

export const QuestionImage: React.FC<QuestionImageProps> = (props) => (
  <ZoomableImage {...props} />
);
