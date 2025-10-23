import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar} from 'react-native';

import {RootStackParamList} from '../types/navigation';
import KycScreen from '../screens/KycScreen';
import VoterScreen from '../screens/VoterScreen';
import AdminScreen from '../screens/AdminScreen';
import TallyScreen from '../screens/TallyScreen';
import WalletConnectScreen from '../screens/WalletConnectScreen';

// Prefer JS stack if native screens unavailable
const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Stack.Navigator
        initialRouteName="KYC"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#059669', // Green-600
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
          gestureEnabled: true,
        }}>
        <Stack.Screen
          name="KYC"
          component={KycScreen}
          options={{
            title: 'BharatVote - Verify Identity',
            headerLeft: () => null, // Disable back button on KYC screen
          }}
        />
        <Stack.Screen
          name="WalletConnect"
          component={WalletConnectScreen}
          options={{
            title: 'Connect Wallet',
          }}
        />
        <Stack.Screen
          name="Voter"
          component={VoterScreen}
          options={{
            title: 'Cast Your Vote',
          }}
        />
        <Stack.Screen
          name="Admin"
          component={AdminScreen}
          options={{
            title: 'Election Administration',
          }}
        />
        <Stack.Screen
          name="Tally"
          component={TallyScreen}
          options={{
            title: 'Election Results',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 