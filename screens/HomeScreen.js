import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useLayoutEffect } from 'react'

import { auth } from '../firebase'

import Icon from 'react-native-ico-material-design';
import AppStyles from '../styles/AppStyles';
 
/**
 * Home screen
 * @param {*} navigation 
 * @returns {JSX.Element}
 */

 const HomeScreen = ({ navigation }) => {
    // Show notifications button in header
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
            <TouchableOpacity
                onPress={showNotifications}
                style={AppStyles.headerButton}
                >
                <Icon name="notifications-button" height='20' width='20' color="#00b5ec" />
            </TouchableOpacity>
            ),
        })
    }, [navigation])
    
    // Handle user wanting to log out
    const handleLogOut = () => {
        auth
        .signOut()
        .then(() => {
            navigation.navigate('Login')
        })
        .catch(error => alert(error.message))
    }

    // Handle user hitting notifications button
    const showNotifications = () => {
        navigation.navigate('Notifications')
      }

   return (
    <View style={styles.container}>
        <Text>Email: {auth.currentUser?.email}</Text>
        {/* Log out button */}
        <TouchableOpacity
            onPress={handleLogOut}
            style={styles.button}
        >
            <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
            {/* <NavigationBar navigation={navigation} /> */}
    </View>
     
   )
 }
 
 export default HomeScreen
 
 const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#00b5ec',
        width: '60%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 40,
    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 18,
    },
      
 })