import React from 'react';
import ClassicTemplate from './ClassicTemplate';
import ModernTemplate from './ModernTemplate';
import TimelineTemplate from './TimelineTemplate';

const TemplateRenderer = ({ 
  template, 
  data, 
  colorTheme = '#2563eb',
  className = '' 
}) => {
  const templateProps = {
    data,
    template,
    colorTheme,
    className
  };

  switch (template?.type) {
    case 'classic':
      return <ClassicTemplate {...templateProps} />;
    case 'modern':
      return <ModernTemplate {...templateProps} />;
    case 'timeline':
      return <TimelineTemplate {...templateProps} />;
    default:
      return <ClassicTemplate {...templateProps} />;
  }
};

export default TemplateRenderer;