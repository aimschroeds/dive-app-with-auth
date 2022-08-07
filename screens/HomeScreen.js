import { useNavigation } from '@react-navigation/native'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Icon from 'react-native-ico-material-design';
import { auth } from '../firebase'
// import { NavigationBar } from '../components/navigationBar.js'
// import { MyTabs } from '../components/tabNavigator.js'
 
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
              <Icon name="add-plus-button" height='20' width='20' color="#00b5ec" />
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
    headerButton: {
        borderWidth: 2,
        borderColor: "#00b5ec",
        borderRadius: 30,
        padding: 6,
      },
      
 })