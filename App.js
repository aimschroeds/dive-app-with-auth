import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { auth } from './firebase';

import HomeScreen from './screens/HomeScreen';
import CoreTabs from './menu/CoreTabs';
import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import NotificationsScreen from './modals/NotificationsScreen';
import ProfileEditScreen from './modals/ProfileEditScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import DiveScreen from './modals/DiveScreen';
import FriendScreen from './screens/FriendScreen';
import DiveLocationModal from './modals/DiveLocationModal';
import AddBuddyModal from './modals/AddBuddy';

const Stack = createNativeStackNavigator();

export default function App() {
    // Set an initializing state whilst Firebase connects
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState();
    // navigation = useNavigation();
    // Handle user state changes
    function onAuthStateChanged(user) {
      setUser(user);
      if (initializing) setInitializing(false);
    }

    useEffect(() => {
      const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
      return subscriber; // unsubscribe on unmount
    }, []);

    if (initializing) return null;

    // if (!user) {
    //   navigation.navigate('Login');
    // }

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
            <Stack.Screen name="Edit Profile" component={ProfileEditScreen} />
            <Stack.Screen name="Dive" component={DiveScreen} />
            <Stack.Screen name="Friend" component={FriendScreen} />
            <Stack.Screen name="Select Dive Location" component={DiveLocationModal} />
            <Stack.Screen name="Select Buddy" component={AddBuddyModal} title="Add Dive Buddies"/>
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>  
    );
}

