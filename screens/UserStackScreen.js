// import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
// import React from 'react'
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { useNavigation } from '@react-navigation/native'
// import LoginScreen from './LoginScreen';
// import ProfileScreen from './ProfileScreen';

// const UserStack = createNativeStackNavigator();

// const UserStackScreen = () => {
//   const navigation = useNavigation()
//   return (
//     <>
//     <UserStack.Navigator options={{ headerShown: false, }}>
//         <UserStack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false,}} />
//         <UserStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false,}}/>
//     </UserStack.Navigator>
//     <SafeAreaView style={{backgroundColor: 'white'}}>
//       <TouchableOpacity onPress={navigation.jumpTo("Profile")}>
//         <Text>Profile</Text>
//       </TouchableOpacity>
//     </SafeAreaView>
//     </>
//   );
// }

// export default UserStackScreen;

// const styles = StyleSheet.create({})