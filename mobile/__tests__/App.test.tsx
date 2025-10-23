import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../src/App';

describe('Mobile App smoke test', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<App />);
    // AppNavigator renders a NavigationContainer implicitly; just ensure tree renders
    expect(getByTestId('RNRootView')).toBeTruthy();
  });
});


