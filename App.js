import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import FeedScreen from './screens/FeedScreen';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'react-native';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Feed') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Flash') {
              iconName = focused ? 'flash' : 'flash-outline';
            }

            return <Ionicons name={iconName} size={size + 2} color={color} />;
          },
          tabBarActiveTintColor: '#00f5ff',
          tabBarInactiveTintColor: '#666',
          headerShown: false,
          tabBarStyle: { 
            backgroundColor: '#0a0a0a',
            borderTopColor: '#333',
            borderTopWidth: 0.5,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Feed" component={FeedScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}