import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './LoginScreen';
import ProfileScreen from './ProfileScreen';

const UserStack = createNativeStackNavigator();

const UserStackScreen = () => {
  return (
    <UserStack.Navigator options={{ headerShown: false, }}>
        <UserStack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false,}} />
        <UserStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false,}}/>
    </UserStack.Navigator>
  );
}

export default UserStackScreen;

const styles = StyleSheet.create({})