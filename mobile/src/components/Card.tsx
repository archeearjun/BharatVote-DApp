import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'medium',
  shadow = true,
}) => {
  const cardStyle = [
    styles.base,
    shadow && styles.shadow,
    styles[padding],
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shadow: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  // Padding variants
  none: {
    padding: 0,
  },
  small: {
    padding: 12,
  },
  medium: {
    padding: 16,
  },
  large: {
    padding: 24,
  },
});

export default Card; 