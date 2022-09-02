import { KeyboardAvoidingView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { TabActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';

import AppStyles from '../styles/AppStyles';

// Adapted from: https://www.youtube.com/watch?v=ql4J6SpLXZA

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    // const jumpToHome = TabActions.jumpTo('Core', { screen: 'Home' });
    const navigation = useNavigation();
    // if (auth.currentUser) {
    //     navigation.navigate('CoreTabs', { screen: 'Home' })
    // }
    
    // Handle auth when user attempts to login
    const handleLogin = () => {
        auth
        .signInWithEmailAndPassword(email, password)
        .then(userCredentials => {
            const user = userCredentials.user
            console.log('Logged in: ', user.email);
            navigation.navigate('CoreTabs', {name: 'Home'});
        })
        .catch(error => setErrorMessage(error.message))
    }
    // If user becomes logged in, redirect to Home screen
    useEffect (() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                navigation.navigate('CoreTabs', {name: 'Home'});
            }
        })
        return unsubscribe
    }, [])

    return (
        <KeyboardAvoidingView
            style={AppStyles.loginContainer}
            behavior="padding"
        >
            {/* Email and password input for login */}
            <View style={AppStyles.loginInputContainer}>
                <TextInput
                    placeholder='Email'
                    value={email}
                    onChangeText={text => setEmail(text)}
                    style={AppStyles.input}
                />
                <TextInput
                    placeholder='Password'
                    value={password}
                    onChangeText={text => setPassword(text)}
                    style={AppStyles.input}
                    secureTextEntry
                />
            </View>
            <View style={AppStyles.loginButtonContainer}>
                {/* Login button */}
                <TouchableOpacity
                    onPress={handleLogin}
                    style={[AppStyles.buttonBlue, AppStyles.buttonBlueLarge]}
                >
                    <Text style={AppStyles.buttonText}>Login</Text>
                </TouchableOpacity>
                {/* Login error message to user */}
                { errorMessage && 
                    <Text style={AppStyles.errorMessage}>{errorMessage}</Text>
                }
                {/* Button to redirect user to registration screen */}
                <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
                    <Text style={AppStyles.loginButtonOutlineText}>Want to Sign Up? Register. </Text>
                </TouchableOpacity>
                {/* Button to redirect user to password reset screen */}
                <TouchableOpacity onPress={() => navigation.navigate('Reset Password')}>
                    <Text style={AppStyles.loginButtonOutlineText}>Forgotten Password? Reset Password. </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

export default LoginScreen
