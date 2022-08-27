import { Image, Text, TouchableOpacity, View } from 'react-native';
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { db, auth, storage } from '../firebase';

import Icon from 'react-native-ico-material-design';
import AppStyles from '../styles/AppStyles';


/**
 * Profile screen enabling user to see own data and settings
 * @param {*} route
 * @param {*} navigation 
 * @returns 
 */

const ProfileScreen = ( { route, navigation }) => {
    const userId = auth.currentUser.uid
    const [userDisplayName, setUserDisplayName] = useState(null)
    const [userProfilePicture, setUserProfilePicture] = useState(null)
    const [userProfilePictureURL, setUserProfilePictureURL] = useState(null)
    const [loading, setLoading] = useState(true)
    const inFocus = useIsFocused();

    // Show edit button in header
    useLayoutEffect(() => {
        const unsubscribe = navigation.setOptions({
            headerRight: () => (
            <TouchableOpacity
                onPress={showEdit}
                style={AppStyles.headerButton}
              >
              <Icon name="create-new-pencil-button" height='20' width='20' color="#00b5ec" />
            </TouchableOpacity>
            ),
        });
        return unsubscribe;
    }, [navigation])

    // When user returns to screen, reload data
    useEffect(() => {
        // setLoading(true);
        if (inFocus) {
            setLoading(true);
        }
    }, [inFocus]);

    // Reference to user's data
    var docRef = db.collection("users").doc(userId);

    // Redirect user to edit screen
    const showEdit = () => {
        navigation.navigate('Edit Profile', { userId: userId })
    }
  
    // Load user data
    if (loading) {
        docRef.get().then((doc) => {
            if (doc.exists) 
            {
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
            } 
            else 
            {
                // doc.data() will be undefined in this case
                console.log("No such User data! ", userId);
            }
        })
        .catch((error) => {
            console.log("Error getting User data:", error);
        });
        setLoading(false);
    }
  
  // Get image ref, download image and set for use on screen
  // TO DO: refactor into helper
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
        {/* When loading complete, show user profile picture */}
        { !loading && 
            userProfilePictureURL &&  
            <Image source={{uri: userProfilePictureURL,}} style={[AppStyles.profilePic]}/> 
        }
        {/* If no user profile picture, show generic avatar icon */}
        { !loading && 
            !userProfilePictureURL &&  
            <Icon name='round-account-button-with-user-inside' width='100' height='100' color='gray' /> 
        }    
        {/* If still loading, show generic avatar icon */}
        { loading && 
            !userProfilePictureURL &&  
            <Icon name='round-account-button-with-user-inside' width='100' height='100' color='gray' /> }     
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