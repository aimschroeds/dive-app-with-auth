import { ActivityIndicator, Image, KeyboardAvoidingView, 
          Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState, useLayoutEffect } from 'react';

import { db, auth, storage } from '../firebase';

import * as ImagePicker from 'expo-image-picker';
import Checkbox from 'expo-checkbox';

import get200ImageRef from '../helpers/get200ImageRef';
import get200ImageUrl from '../helpers/get200ImageUrl';

import Icon from 'react-native-ico-material-design';
import AppStyles from '../styles/AppStyles';

/**
 * Modal enabling user to edit profile
 * @param {*} navigation 
 * @returns {JSX.Element}
 */
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

    // Set header to have cancel and save buttons
    useLayoutEffect(() => {
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


    // Handle image picking
    let openImagePickerAsync = async () => {
        // Get permission to open photo roll 
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        // If no access is granted
        if (permissionResult.granted === false) {
            setErrorMessage("Permission to access camera roll is required!");
            return;
        }
        
        // Launch image picker
        let pickerResult = await ImagePicker.launchImageLibraryAsync();

        // Return if image picker is cancelled
        if (pickerResult.cancelled === true) {
            return;
        }

        // Result of image picker to be uploaded
        handleImageUpload(pickerResult.uri)
    }

    // Upload image to firebase bucket
    const handleImageUpload = async (uri) => {
        // Attempt to upload image and set as profile picture
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
  
    // Take image uri, convert to blob, and upload to bucket
    async function uploadImageAsync(uri) {
      // Convert to blob
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
        // Create ref at which to upload image
        const photo_id = uri.split('/').pop();
        setUserProfilePicture(photo_id)
        const ref = storage.ref().child(`${auth.currentUser.uid}/${photo_id}`);
        // Upload image
        const snapshot = await ref.put(blob);
        // We're done with the blob, close and release it
        blob.close();
        // Get download url of image
        return await snapshot.ref.getDownloadURL();
    }

    // Return to previous page if user cancels
    const cancelEditProfile = () => {
        navigation.goBack()
    }

    // Return to previous page with new data saved
    const saveEditProfile = () => {
        updateUserData()
        updateUserDataPublic()
        navigation.goBack()
    }


    // Update user data
    let updateUserDataPublic = async () => {
        // Save 200x200 image as user profile picture
        let image_200 = get200ImageRef(userProfilePicture)
        let image_200_url = get200ImageUrl(userProfilePictureURL)
        let data = {
            display_name: userName,
            image_ref: userProfilePictureURL,
            image: image_200,
            image_200_url: image_200_url,
            searchable: userSearchEnabled,
            createdAt: new Date(),
        }
        // Merge new user data with existing
        db.collection("users").doc(auth.currentUser.uid).set(data, { merge: true })
        .then(() => {
            console.log("Document written");
            setSuccessMessage('Profile data updated!')
            // Return user to their profile screen
            navigation.navigate('Profile')
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
            setErrorMessage(error.message)
        });
    };

    // Get reference to db for current user
    var docRef = db.collection("users").doc(auth.currentUser.uid);


    // If screen is loading, load user data
    if (screenLoading) {
        docRef.get().then((doc) => {
            if (doc.exists) {
                doc.data().display_name ? setUserName(doc.data().display_name) : setUserName('')
                doc.data().image_200_url ? setUserProfilePictureURL(doc.data().image_200_url) : console.log('no image')
                doc.data().searchable ? setUserSearchEnabled(doc.data().searchable) : setUserSearchEnabled(false)
                userProfilePicture ? setImage(userProfilePicture) : console.log("Using image ref")
                console.log("Document data:", doc.data());
                setScreenLoading(false)
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
                setScreenLoading(false)
            }
        })
        .catch((error) => {
            console.log("Error getting document:", error);
        }); 
    }


    // Update private user data
    const updateUserData = () => {
        auth.currentUser.updateProfile({
              displayName: hiddenName,
              photoURL: userProfilePictureURL
          })
          .then(() => {
              // Update successful
              setSuccessMessage('Profile updated successfully')
          })
          .catch((error) => {
              // An error occurred
              setErrorMessage(error.message)
          });  
    }


    // If user updates email, send email verification
    const updateUserEmail = () => {
        auth.currentUser.updateEmail(userEmail)
        .then(() => {
            // Update successful
            setSuccessMessage('Email updated successfully')
            auth.currentUser.sendEmailVerification().then(() => {
                // Email sent.
                setSuccessMessage('Email verification sent')
            });
        })
        .catch((error) => {
            // An error occurred
            setErrorMessage(error.message)
        });
    }


    // Get user profile picture
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
                {/* User profile picture */}
                { userProfilePictureURL &&  <Image source={{uri: userProfilePictureURL,}} style={[AppStyles.profilePic]}/> }
                { !userProfilePictureURL &&  <Icon name='round-account-button-with-user-inside' width='100' height='100' color='gray' style={[AppStyles.profilePic]} /> }
                {/* Upload button to trigger image picker */}
                <TouchableOpacity style={{zIndex: 30, position: 'absolute', top: 30, left: 45}}  onPress={openImagePickerAsync}>
                    { imageLoading && <ActivityIndicator size="small" color="#FBDA76" /> }
                    { !imageLoading && <Icon name='create-new-pencil-button' width='40' height='40' color='white' background={{type: 'circle', color: '#FBDA76'}} /> }
                </TouchableOpacity>   
               {/* Input for setting username */}
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
                {/* Checkbox for user to set themselves to be searchable/not */}
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
        {/* TO DO: Comment up */}
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
