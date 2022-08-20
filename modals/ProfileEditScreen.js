import { ActivityIndicator, Button, DatePickerIOSBase, Image, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import AppStyles from '../styles/AppStyles'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { Cell, Section, TableView } from 'react-native-tableview-simple';
import Icon from 'react-native-ico-material-design';
import { db, auth, storage } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore"; 
import * as ImagePicker from 'expo-image-picker';
import Checkbox from 'expo-checkbox';


const ProfileEditScreen = ( { navigation }) => {
  const [userName, setUserName] = useState('')
  const [hiddenName, setHiddenName] = useState(auth.currentUser.displayName)
  const [userEmail, setUserEmail] = useState(auth.currentUser.email)
  const [userProfilePicture, setUserProfilePicture] = useState(null)
  const [userProfilePictureURL, setUserProfilePictureURL] = useState(null) // Firebase storage URL
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [screenLoading, setScreenLoading] = useState(true)
  const [imageLoading, setImageLoading] = useState(false)
  const [userSearchEnabled, setUserSearchEnabled] = useState(false)

  let openImagePickerAsync = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync();

    if (pickerResult.cancelled === true) {
        return;
      }

    console.log(pickerResult);
    handleImageUpload(pickerResult.uri)
  }

  const handleImageUpload = async (uri) => {
    console.log("uri: ", uri);
    try {
      setImageLoading(true)
      const uploadUrl = await uploadImageAsync(uri);
      setUserProfilePictureURL(uploadUrl);
    }
    catch (error) {
       setErrorMessage(error.message)
    }
    finally {
      setImageLoading(false)
    }
  }
  
  async function uploadImageAsync(uri) {
    const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.log(e);
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });

      const photo_id = uri.split('/').pop();
      setUserProfilePicture(photo_id)
      const ref = storage.ref().child(auth.currentUser.uid + '/' + photo_id);
      const snapshot = await ref.put(blob);
      // We're done with the blob, close and release it
      blob.close();
      return await snapshot.ref.getDownloadURL();
  }

  React.useLayoutEffect(() => {
    const unsubscribe = navigation.setOptions({
        headerLeft: () => (
          <Text 
            onPress={cancelEditProfile}
            style={AppStyles.plusButtonText}>Cancel</Text>
            ),
        headerRight: () => (
            <Text
            onPress={saveEditProfile}
            style={AppStyles.plusButtonText}>Save</Text>
            ),
        })
    return unsubscribe
    }, [navigation, userName, userProfilePictureURL, userSearchEnabled])

    const cancelEditProfile = () => {
        navigation.goBack()
    }

    const saveEditProfile = () => {
        updateUserData()
        updateUserDataPublic()
        navigation.goBack()
    }

    let updateUserDataPublic = async () => {
        console.log("update", userProfilePictureURL)
        let data = {
          display_name: userName,
          image_ref: userProfilePictureURL,
          image: userProfilePicture,
          searchable: userSearchEnabled,
          createdAt: new Date(),
        }
        db.collection("users").doc(auth.currentUser.uid).set(data, { merge: true })
        .then(() => {
            console.log("Document written");
            setSuccessMessage('Profile data updated!')
            navigation.navigate('Profile')
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
            setErrorMessage(error.message)
        });
      };


  var docRef = db.collection("users").doc(auth.currentUser.uid);

if (screenLoading) {
  docRef.get().then((doc) => {
      if (doc.exists) {
          doc.data().display_name ? setUserName(doc.data().display_name) : setUserName('')
          doc.data().image_ref ? setUserProfilePictureURL(doc.data().image_ref) : console.log('no image')
          doc.data().searchable ? setUserSearchEnabled(doc.data().searchable) : setUserSearchEnabled(false)
        //   userProfilePictureURL ? setUserProfilePictureURL(userProfilePictureURL) : setUserProfilePicture(doc.data().image_ref)
          userProfilePicture ? setImage(userProfilePicture) : console.log("Using image ref")
        //   setImage(userProfilePicture)
          console.log("Document data:", doc.data());
          setScreenLoading(false)
      } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
          setScreenLoading(false)
      }
  }).catch((error) => {
      console.log("Error getting document:", error);
  });
  
}

const updateUserData = () => {
    auth.currentUser.updateProfile({
        displayName: hiddenName,
        photoURL: userProfilePictureURL
      }).then(() => {
        // Update successful
        setSuccessMessage('Profile updated successfully')
      }).catch((error) => {
        // An error occurred
        setErrorMessage(error.message)
      });  
}

const updateUserEmail = () => {
    auth.currentUser.updateEmail(userEmail).then(() => {
        // Update successful
        setSuccessMessage('Email updated successfully')
        auth.currentUser.sendEmailVerification().then(() => {
            // Email sent.
            setSuccessMessage('Email verification sent')
          });
      }).catch((error) => {
        // An error occurred
        setErrorMessage(error.message)
      });
}

const setImage = (image) => {
  // Create a reference to the file we want to show
  var storageRef = storage.ref();
  var profilePicRef = storageRef.child(auth.currentUser.uid + '/' + image);
  // Get the download URL
  profilePicRef.getDownloadURL()
  .then((url) => {
    // Insert url into an <img> tag to "download"
    setUserProfilePictureURL(url)
  })
  .catch((error) => {
    // A full list of error codes is available at
    // https://firebase.google.com/docs/storage/web/handle-errors
    switch (error.code) {
      case 'storage/object-not-found':
        // File doesn't exist
        setErrorMessage('File doesn\'t exist')
        break;
      case 'storage/unauthorized':
        // User doesn't have permission to access the object
        setErrorMessage('User doesn\'t have permission to access the object')
        break;
      case 'storage/canceled':
        // User canceled the upload
        setErrorMessage('User canceled the upload')
        break;
      case 'storage/unknown':
        // Unknown error occurred, inspect the server response
        setErrorMessage('Unknown error occurred, please try again')
        break;
    }
  });
};



  return (
    <>
    <KeyboardAvoidingView behavior="padding">
        <View style={[AppStyles.container]}>
            <View style={[ AppStyles.section]}>
                {/* <View style={{borderWidth: 1, width: 100}}> */}
                { userProfilePictureURL &&  <Image source={{uri: userProfilePictureURL,}} style={[AppStyles.profilePic]}/> }
                { !userProfilePictureURL &&  <Icon name='round-account-button-with-user-inside' width='100' height='100' color='gray' style={[AppStyles.profilePic]} /> }
                <TouchableOpacity style={{zIndex: 30, position: 'absolute', top: 30, left: 45}}  onPress={openImagePickerAsync}>
                    { imageLoading && <ActivityIndicator size="small" color="#FBDA76" /> }
                    { !imageLoading && <Icon name='create-new-pencil-button' width='40' height='40' color='white' background={{type: 'circle', color: '#FBDA76'}} /> }
                </TouchableOpacity>            
                <TextInput
                    style={AppStyles.userDataInput}
                    onChangeText={(text) => setUserName(text)}
                    value={userName}
                    placeholder={userName ? userName : "Enter your name"}
                    placeholderTextColor={'black'}
                />
            </View>
        
            <View style={[ AppStyles.section, AppStyles.topMargin]}>
            {/* <View> */}
                <Checkbox
                style={[AppStyles.checkbox, AppStyles.leftAlign]}
                value={userSearchEnabled}
                onValueChange={setUserSearchEnabled}
                color={userSearchEnabled ? '#FBDA76' : undefined}
                />
                <Text style={AppStyles.paragraph}>Allow Other Users to Search For You</Text>
            </View>
        </View>
        {/* </View> */}
        <View style={[AppStyles.container,]}>
        <TouchableOpacity onPress={openImagePickerAsync} style={AppStyles.button}>
                    <Text style={AppStyles.buttonText}>Change</Text>
            </TouchableOpacity>
            <Text style={[AppStyles.titleText]}>{userEmail}</Text>
            <TouchableOpacity 
                style={AppStyles.button} 
                onPress={saveEditProfile}>
                <Text style={AppStyles.buttonText}>Update</Text>
            </TouchableOpacity>
        </View>
        
    </KeyboardAvoidingView>
      </>)
}

export default ProfileEditScreen
