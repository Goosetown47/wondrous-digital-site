import React from 'react';
import Button, { ButtonVariant, ButtonRadius, ButtonStyle } from './Button';

interface ButtonPreviewProps {
  variant: ButtonVariant;
  radius: ButtonRadius;
  style: ButtonStyle;
}

const ButtonPreview: React.FC<ButtonPreviewProps> = ({
  variant = 'primary',
  radius = 'slightly-rounded',
  style = 'default',
}) => {
  const getButtonText = () => {
    switch (variant) {
      case 'primary':
        return 'Primary Button';
      case 'secondary':
        return 'Secondary Button';
      case 'tertiary':
        return 'Tertiary Button';
      case 'outline': // Legacy support
        return 'Tertiary Button';
      case 'text-link':
        return 'Text Link';
      default:
        return 'Button';
    }
  };

  return (
    <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
      <Button
        variant={variant}
        style={style}
      >
        {getButtonText()}
      </Button>
    </div>
  );
};

export default ButtonPreview;