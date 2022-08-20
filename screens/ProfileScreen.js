import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import AppStyles from '../styles/AppStyles'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Cell, Section, TableView } from 'react-native-tableview-simple';
import { useNavigation } from '@react-navigation/native'
import LoginScreen from './LoginScreen';
import Icon from 'react-native-ico-material-design';
import { db, auth, storage } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore"; 


const ProfileScreen = ( { route, navigation }) => {
  const { userId } = route.params
  // const [userFirstName, setUserFirstName] = useState(null)
  const [userDisplayName, setUserDisplayName] = useState(null)
  // const [userLastName, setUserLastName] = useState(null)
  const [userProfilePicture, setUserProfilePicture] = useState(null)
  const [userProfilePictureURL, setUserProfilePictureURL] = useState(null)

  var docRef = db.collection("users").doc(userId);

  const showEdit = () => {
    navigation.navigate('Edit Profile', { userId: userId })
  }

  // useEffect (() => {
  //   const unsubscribe = auth.onAuthStateChanged(user => {
  //       if (!user) {
  //           navigation.navigate('Login')
  //       }
  //   })
  //   return unsubscribe
  // }, [])

  React.useLayoutEffect(() => {
    if (auth.currentUser.uid===userId) {
      navigation.setOptions({
          headerRight: () => (
          <TouchableOpacity
              onPress={showEdit}
              style={AppStyles.headerButton}
            >
            <Icon name="create-new-pencil-button" height='20' width='20' color="#00b5ec" />
          </TouchableOpacity>
          ),
      }) }
  }, [navigation])

  docRef.get().then((doc) => {
      if (doc.exists) {
          setUserDisplayName(doc.data().display_name)
          // setUserLastName(doc.data().last_name)
          setUserProfilePicture(doc.data().image_ref)
          setImage(userProfilePicture)
          console.log("Document data:", doc.data());
      } else {
          // doc.data() will be undefined in this case
          console.log("No such document! ", userId);
      }
  }).catch((error) => {
      console.log("Error getting document:", error);
  });

const setImage = (image) => {
  // Create a reference to the file we want to download
  var storageRef = storage.ref();
  var profilePicRef = storageRef.child('profile_pictures/' + image);
  // Get the download URL
  profilePicRef.getDownloadURL()
  .then((url) => {
    // Insert url into an <img> tag to "download"
    setUserProfilePictureURL(url)
    console.log(userProfilePictureURL)
  })
  .catch((error) => {
    // A full list of error codes is available at
    // https://firebase.google.com/docs/storage/web/handle-errors
    switch (error.code) {
      case 'storage/object-not-found':
        // File doesn't exist
        break;
      case 'storage/unauthorized':
        // User doesn't have permission to access the object
        break;
      case 'storage/canceled':
        // User canceled the upload
        break;

      // ...

      case 'storage/unknown':
        // Unknown error occurred, inspect the server response
        break;
    }
  });
};



  return (
    <>
    <View style={[AppStyles.container]}>
      {/* <Text>{userProfilePictureURL}</Text> */}
      { userProfilePictureURL &&  <Image source={{uri: userProfilePictureURL,}} style={[AppStyles.profilePic]}/> }
      { !userProfilePictureURL &&  <Icon name='round-account-button-with-user-inside' width='100' height='100' color='gray' /> }     
    </View>
    <View style={[AppStyles.section]}>
      <Text style={[AppStyles.titleText]}>{userDisplayName} </Text>      
    </View>
    <Text style={[AppStyles.titleText]}>{userId}</Text>
      </>
)
}

export default ProfileScreen

const styles = StyleSheet.create({})