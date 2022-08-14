import { useNavigation } from '@react-navigation/core'
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { auth } from '../firebase'
import AppStyles from '../styles/AppStyles'
import { sendEmailVerification } from 'firebase/auth'
// Adapted from: https://www.youtube.com/watch?v=ql4J6SpLXZA

const RegistrationScreen = ( { navigation }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState(null)

    // const navigation = useNavigation()

    useEffect (() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                navigation.navigate('Home')
            }
        })
        return unsubscribe
    }, [])

    const handleSignUp = () => {
        auth
         .createUserWithEmailAndPassword(email, password)
         .then(userCredentials => {
            const user = userCredentials.user
            console.log(user.email);
            auth.currentUser.sendEmailVerification()
            .then(() => {
                // Email verification sent
            })
         })
         .catch(error => console.log(error.message))
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
            {errorMessage && <Text style={AppStyles.errorMessage}>{errorMessage}</Text>}
                <TouchableOpacity
                    onPress={handleSignUp}
                    style={[AppStyles.loginButton, AppStyles.loginButtonOutline]}
                >
                    <Text style={AppStyles.loginButtonOutlineText}>Register</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={AppStyles.loginButtonOutlineText}>Already Signed Up? Login. </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

export default RegistrationScreen
