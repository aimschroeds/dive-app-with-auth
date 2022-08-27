import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Icon from 'react-native-ico-material-design';

import HomeScreen from '../screens/HomeScreen';
import AddDiveScreen from '../screens/AddDiveScreen';
import ExploreScreen from '../screens/ExploreScreen';
import FindFriendsScreen from '../screens/FindFriendsScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { auth } from '../firebase';

const Tab = createBottomTabNavigator();

/**
 * Primary bottom tab navigation for the app (logged in users only)
 * @returns {JSX.Element} 
 */

function CoreTabs() {
    return (
    <Tab.Navigator
    initialRouteName="Login"
    screenOptions={{
        tabBarActiveTintColor: '#FBDA76',
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
    );}

export default CoreTabs;