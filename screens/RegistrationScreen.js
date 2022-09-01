import { KeyboardAvoidingView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { auth } from '../firebase'
import AppStyles from '../styles/AppStyles'
import { sendEmailVerification } from 'firebase/auth'
// Adapted from: https://www.youtube.com/watch?v=ql4J6SpLXZA

/**
 * Enable user to register
 * @param {*} navigation 
 * @returns 
 */

const RegistrationScreen = ( { navigation }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState(null)

    // If user becomes logged in, redirect to Home screen
    useEffect (() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                navigation.navigate('Home')
            }
        })
        return unsubscribe
    }, [])

    // Handle user signup; create account
    const handleSignUp = () => {
        auth
         .createUserWithEmailAndPassword(email, password)
         .then(userCredentials => {
            const user = userCredentials.user
            console.log(user.email);
            auth.currentUser.sendEmailVerification()
            .then(() => {
                // Email verification sent
                // TO DO: verify this works
                auth.currentUser.sendEmailVerification()
                .then(() => {
                    setSuccessMessage('Verification email sent!')
                })
                .catch(error => {
                    setErrorMessage(error.message)
                })
            })
         })
         .catch(error => console.log(error.message))
    }

    return (
        <KeyboardAvoidingView
            style={AppStyles.loginContainer}
            behavior="padding"
        >
            {/* Email and password input fields */}
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
                {errorMessage && 
                    <Text style={AppStyles.errorMessage}>{errorMessage}</Text>
                }
                {/* Sign Up Button */}
                <TouchableOpacity
                    onPress={handleSignUp}
                    style={[AppStyles.buttonBlue, AppStyles.buttonBlueLarge]}
                >
                    <Text style={AppStyles.buttonText}>Register</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={AppStyles.loginButtonOutlineText}>Already Signed Up? Login. </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

export default RegistrationScreen
