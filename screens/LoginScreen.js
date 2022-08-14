import { useNavigation } from '@react-navigation/core'
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { auth } from '../firebase'
import AppStyles from '../styles/AppStyles'

// Adapted from: https://www.youtube.com/watch?v=ql4J6SpLXZA

const LoginScreen = ( {navigation} ) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState(null)

    // const navigation = useNavigation()

    // useEffect (() => {
    //     const unsubscribe = auth.onAuthStateChanged(user => {
    //         if (user) {
    //             navigation.navigate('Home')
    //         }
    //     })
    //     return unsubscribe
    // }, [])

    const handleLogin = () => {
        auth
        .signInWithEmailAndPassword(email, password)
        .then(userCredentials => {
            const user = userCredentials.user
            console.log('Logged in: ', user.email);
            navigation.navigate('Core', {name: 'Home'})
        })
        .catch(error => setErrorMessage(error.message))
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
                <TextInput
                    placeholder='Password'
                    value={password}
                    onChangeText={text => setPassword(text)}
                    style={AppStyles.loginInput}
                    secureTextEntry
                />
            </View>
            <View style={AppStyles.loginButtonContainer}>
                <TouchableOpacity
                    onPress={handleLogin}
                    style={AppStyles.loginButton}
                >
                    <Text style={AppStyles.loginButtonText}>Login</Text>
                </TouchableOpacity>
                {errorMessage && <Text style={AppStyles.errorMessage}>{errorMessage}</Text>}
                <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
                    <Text style={AppStyles.loginButtonOutlineText}>Want to Sign Up? Register. </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Reset Password')}>
                    <Text style={AppStyles.loginButtonOutlineText}>Forgotten Password? Reset Password. </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

export default LoginScreen
