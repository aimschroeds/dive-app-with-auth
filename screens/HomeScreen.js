import { useNavigation } from '@react-navigation/native'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { auth } from '../firebase'
 
 const HomeScreen = () => {

    const navigation = useNavigation()

    const handleLogOut = () => {
        auth
        .signOut()
        .then(() => {
            navigation.replace('Login')
        })
        .catch(error => alert(error.message))
    }

    const goToAddDive = () => {
        navigation.navigate('Add Dive')
      }

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
            <TouchableOpacity
                onPress={goToAddDive}
                style={styles.headerButton}
              >
              <Text style={styles.plusButtonText}>+</Text>
            </TouchableOpacity>
            ),
        })
    }, [navigation])

   return (
     <View style={styles.container}>
       <Text>Email: {auth.currentUser?.email}</Text>
       <TouchableOpacity
            onPress={handleLogOut}
            style={styles.button}
       >
            <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
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
    headerButton: {
        borderWidth: 2,
        borderColor: "#00b5ec",
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 6,
        paddingRight: 6,
        paddingBottom: 3,
        
      },
      plusButtonText: {
        color: '#00b5ec',
        fontWeight: '700',
        fontSize: 24,
    },
 })