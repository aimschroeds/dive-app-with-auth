import { useNavigation } from '@react-navigation/native'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Icon from 'react-native-ico-material-design';
import { auth } from '../firebase'
// import { NavigationBar } from '../components/navigationBar.js'
// import { MyTabs } from '../components/tabNavigator.js'
import AppStyles from '../styles/AppStyles';
 
 const HomeScreen = ({ navigation }) => {
    // const [notificationsVisible, setNotificationsVisible] = useState(false)

    // const navigation = useNavigation()

    const handleLogOut = () => {
        auth
        .signOut()
        .then(() => {
            navigation.navigate('Login')
        })
        .catch(error => alert(error.message))
    }

    const showNotifications = () => {
        navigation.navigate('Notifications')
      }

    React.useLayoutEffect(() => {
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
      
 })