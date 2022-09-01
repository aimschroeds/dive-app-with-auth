import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react';

import { auth } from '../firebase'

import AppStyles from '../styles/AppStyles';
import { useNavigation } from '@react-navigation/native';

const LogoutButton = () => {
    const [errorMessage, setErrorMessage] = useState(null);
    const navigation = useNavigation();

// Handle user wanting to log out
const handleLogOut = () => {
    auth
    .signOut()
    .then(() => {
        navigation.navigate('Login')
    })
    .catch(error => setErrorMessage(error.message))
}
  return (
    <View style={{alignItems: 'center', marginTop: -55}}>
      {/* Log out button */}
        <TouchableOpacity
            onPress={handleLogOut}
            style={[AppStyles.buttonBlue, AppStyles.buttonBlueSmall]}
        >
            <Text style={AppStyles.locationButtonText}>Logout</Text>
        </TouchableOpacity>
    </View>
  )
}

export default LogoutButton