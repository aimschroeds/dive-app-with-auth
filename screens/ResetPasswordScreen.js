import { useNavigation } from '@react-navigation/core'
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { auth } from '../firebase'
import AppStyles from '../styles/AppStyles'


// Adapted from: https://www.youtube.com/watch?v=ql4J6SpLXZA

const ResetPasswordScreen = ( { navigation } ) => {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // const navigation = useNavigation()

    const handleResetPassword = () => {
        auth
        .sendPasswordResetEmail(email)
        .then(() => {
          // Password reset email sent!
          setSuccessMessage('Email sent!');
        })
        .catch((error) => {
          setErrorMessage(error.message);
          // ..
    });
    }
    return (
        <KeyboardAvoidingView
            style={AppStyles.loginContainer}
            behavior="padding"
        >
            <View style={AppStyles.loginInputContainer}>
                <TextInput
                    placeholder='Email'
                    value={email}
                    onChangeText={text => setEmail(text)}
                    style={AppStyles.loginInput}
                />
            </View>
            <View style={AppStyles.loginButtonContainer}>
                <TouchableOpacity
                    onPress={handleResetPassword}
                    style={[AppStyles.button, AppStyles.loginButtonOutline]}
                >
                    <Text style={AppStyles.loginButtonOutlineText}>Reset Password</Text>
                </TouchableOpacity>
                {errorMessage && <Text style={AppStyles.errorMessage}>{errorMessage}</Text>}
                {successMessage && <Text style={AppStyles.successMessage}>{successMessage}</Text>}
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={AppStyles.loginButtonOutlineText}>Return to Login. </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

export default ResetPasswordScreen;