import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { NavigationContainer, StackActions, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CoreTabs from './menu/CoreTabs';
import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import NotificationsScreen from './modals/NotificationsScreen';
import ProfileEditScreen from './modals/ProfileEditScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import { auth } from './firebase';

const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Group>
          { auth.currentUser && <Stack.Screen name="CoreTabs" component={CoreTabs} options={{ headerShown: false, }} /> }
          <Stack.Screen name="Core" component={CoreTabs} options={{ headerShown: false, }}/>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false, }}/>
          <Stack.Screen name="Registration" component={RegistrationScreen} options={{ headerShown: false, }}/>
          <Stack.Screen name="Reset Password" component={ResetPasswordScreen} options={{ headerShown: false, }} />
        </Stack.Group>
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Profile Edit" component={ProfileEditScreen} />
        </Stack.Group>
      </Stack.Navigator>
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
