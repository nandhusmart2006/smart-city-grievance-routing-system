import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './src/screens/WelcomeScreen';
import SubmitScreen from './src/screens/SubmitScreen';
import TrackScreen from './src/screens/TrackScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#f8fafc' }
        }}
      >
        <Stack.Screen name="Home" component={WelcomeScreen} />
        <Stack.Screen name="Submit" component={SubmitScreen} />
        <Stack.Screen name="Track" component={TrackScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
