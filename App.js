import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import LocalScreen from './screens/LocalNewsScreen';
import BookmarksScreen from './screens/BookmarksScreen';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'react-native';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
              else if (route.name === 'Local') iconName = focused ? 'location' : 'location-outline';
              else if (route.name === 'Bookmarks') iconName = focused ? 'bookmark' : 'bookmark-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#00f5ff',
            tabBarInactiveTintColor: '#666',
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#0a0a0a',
              borderTopColor: '#333',
              borderTopWidth: 0.5,
              height: 90,
              paddingBottom: 40,
              paddingTop: 8,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Local" component={LocalScreen} />
          <Tab.Screen name="Bookmarks" component={BookmarksScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
