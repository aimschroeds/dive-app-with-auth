import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
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
  const userId = auth.currentUser.uid
  const [userDisplayName, setUserDisplayName] = useState(null)
  const [userProfilePicture, setUserProfilePicture] = useState(null)
  const [userProfilePictureURL, setUserProfilePictureURL] = useState(null)
  const [loading, setLoading] = useState(true)

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
      setLoading(true);
      navigation.setOptions({
          headerRight: () => (
          <TouchableOpacity
              onPress={showEdit}
              style={AppStyles.headerButton}
            >
            <Icon name="create-new-pencil-button" height='20' width='20' color="#00b5ec" />
          </TouchableOpacity>
          ),
      })
      const unsubscribe = navigation.addListener('focus', () => {
        setLoading(true);
      });
      return unsubscribe;
  }, [navigation])

if (loading) {
    docRef.get().then((doc) => {
      if (doc.exists) {
          setUserDisplayName(doc.data().display_name);
          if (doc.data().image_200_url)
          {
            setUserProfilePictureURL(doc.data().image_200_url);
          }
          else if (doc.data().image)
          {
            setUserProfilePicture(doc.data().image);
            setImage(userProfilePicture);
          }
          else 
          {
            setUserProfilePicture(null);
            setUserProfilePictureURL(null);
          }
          
          console.log("User data downloaded");
      } else {
          // doc.data() will be undefined in this case
          console.log("No such User data! ", userId);
      }
  }).catch((error) => {
      console.log("Error getting User data:", error);
  });
  setLoading(false);
}
  

const setImage = (image) => {
  // Create a reference to the file we want to download
  var storageRef = storage.ref();
  var profilePicRef = storageRef.child(userId + '/' + image);
  // Get the download URL
  profilePicRef.getDownloadURL()
  .then((url) => {
    // Insert url into an <img> tag to "download"
    setUserProfilePictureURL(url)
    console.log('Image downloaded');
    setLoading(false)
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
      {/* { loading && <ActivityIndicator size="large" color="#00b5ec" /> } */}
      { !loading && userProfilePictureURL &&  <Image source={{uri: userProfilePictureURL,}} style={[AppStyles.profilePic]}/> }
      { !loading && !userProfilePictureURL &&  <Icon name='round-account-button-with-user-inside' width='100' height='100' color='gray' /> }    
      { loading && !userProfilePictureURL &&  <Icon name='round-account-button-with-user-inside' width='100' height='100' color='gray' /> }     
    </View>
    <View style={[AppStyles.section]}>
      <Text style={[AppStyles.titleText]}>{userDisplayName} {loading}</Text>      
      
    </View>
    <View style={[AppStyles.section]}>
      <Text style={[AppStyles.titleText]}>{userId}</Text>
    </View>
      </>
)
}

export default ProfileScreen;