import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import AddDiveScreen from './screens/AddDiveScreen';
import ProfileScreen from './screens/ProfileScreen';
import ExploreScreen from './screens/ExploreScreen';
import FindFriendsScreen from './screens/FindFriendsScreen';
import Icon from 'react-native-ico-material-design';

const Tab = createBottomTabNavigator();

export default function App() {

  return (
    <NavigationContainer>
    <Tab.Navigator
    initialRouteName="HomeScreen"
    screenOptions={{
        tabBarActiveTintColor: '#e91e63',
    }}
    >
      <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
              tabBarLabel: 'Home',
              tabBarIcon: ({ color, size }) => (
                  <Icon name='home-button' height={size} width={size} color={color} />
              ),
          }}
      />  
      <Tab.Screen
          name="Explore"
          component={ExploreScreen}
          options={{
              tabBarLabel: 'Explore',
              tabBarIcon: ({ color, size }) => (
                  <Icon name='map-symbol' height={size} width={size} color={color} />
              ),
          }}
      />  
      <Tab.Screen
          name="Add Dive"
          component={AddDiveScreen}
          options={{
              tabBarLabel: 'Add Dive',
              tabBarIcon: ({ color, size }) => (
                  <Icon name='add-plus-button' height={size} width={size} color={color} />
              ),
          }}
      />  
      <Tab.Screen
          name="Friends"
          component={FindFriendsScreen}
          options={{
              tabBarLabel: 'Find Friends',
              tabBarIcon: ({ color, size }) => (
                  <Icon name='users-social-symbol' height={size} width={size} color={color} />
              ),
          }}
      />  
      <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
              tabBarLabel: 'Profile',
              tabBarIcon: ({ color, size }) => (
                  <Icon name='round-account-button-with-user-inside' height={size} width={size} color={color} />
              ),
          }}
      />  
    
    </Tab.Navigator>
</NavigationContainer>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

});
