import { KeyboardAvoidingView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { auth } from '../firebase';

import AppStyles from '../styles/AppStyles';


// Adapted from: https://www.youtube.com/watch?v=ql4J6SpLXZA

/**
 * Enables user to send reset password email
 * @param {*} navigation 
 * @returns {JSX.Element}
 */
const ResetPasswordScreen = ( { navigation } ) => {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Send password reset email
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
            {/* Email input */}
            <View style={AppStyles.loginInputContainer}>
                <TextInput
                    placeholder='Email'
                    value={email}
                    onChangeText={text => setEmail(text)}
                    style={AppStyles.input}
                />
            </View>
            <View style={AppStyles.loginButtonContainer}>
                {/* Reset password button */}
                <TouchableOpacity
                    onPress={handleResetPassword}
                    style={[AppStyles.buttonBlue, AppStyles.buttonBlueLarge]}
                >
                    <Text style={AppStyles.buttonText}>Reset Password</Text>
                </TouchableOpacity>
                {/* Error/Success messaging */}
                {errorMessage && 
                    <Text style={AppStyles.errorMessage}>{errorMessage}</Text>
                }
                {successMessage && 
                    <Text style={AppStyles.successMessage}>{successMessage}</Text>
                }
                {/* Button to return user to Login Screen */}
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={AppStyles.loginButtonOutlineText}>Return to Login </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

export default ResetPasswordScreen;