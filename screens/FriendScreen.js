import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
import React, { useState, useLayoutEffect, useEffect } from 'react';
import { db, auth, storage } from '../firebase';
import { useIsFocused } from '@react-navigation/native';

import Icon from 'react-native-ico-material-design';
import AppStyles from '../styles/AppStyles';
import UserDetails from '../components/UserDetails';
import FriendStatus from '../components/FriendStatus';
import DiveShort from '../components/DiveShort';


/**
 * Screen for seeing Friends profile details
 * @param {*} route 
 * @param {*} navigation
 * @returns {JSX.Element}
 */

const FriendScreen = ( { route, navigation }) => {
    const { userId } = route.params
    const [userDisplayName, setUserDisplayName] = useState(null)
    // const [userLastName, setUserLastName] = useState(null)
    const [userProfilePicture, setUserProfilePicture] = useState(null)
    const [userProfilePictureURL, setUserProfilePictureURL] = useState(null)
    const [relationship, setRelationship] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)
    const [loading, setLoading] = useState(true)
    const [imageLoading, setImageLoading] = useState(true)
    const inFocus = useIsFocused();
    const [dives, setDives] = useState([]);

    // When user returns to screen, reload data
    useEffect(() => {
      // setLoading(true);
      if (inFocus) {
          setLoading(true);
      }
  }, [inFocus]);

    // If user somehow attempted to view their own 'friend' screen, redirect to Profile screen
    if (userId === auth.currentUser.uid) {
        navigation.navigate('Profile')
    }

    // Return user to previous screen
    const goBack = () => {
        navigation.goBack();
    }

    // Show back button in header
    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
              <Text 
                onPress={goBack}
                style={AppStyles.plusButtonText}>Back</Text>
            ),
        })
    }, [navigation, relationship])

    // Upon screen load, load data
    if (loading) {
        // Get current user data
        var friendRef = db.collection("friends").doc(auth.currentUser.uid);
        // Get relationship with friend data
        var relationshipRef = friendRef.collection("relationships").doc(userId);
        // Set relationship
        relationshipRef.get().then((doc) => {
            if (doc.exists) {
                setRelationship(doc.data().status)
            }
            else {
                setRelationship('none')
            }
        })
        .catch((error) => {
            console.log("Error getting document:", error);
        });
        
        // Get friend user data
        var userRef = db.collection("users").doc(userId);
        userRef.get().then((doc) => {
            if (doc.exists) 
            {
                setUserDisplayName(doc.data().display_name);
                if (doc.data().image_200_url)
                {
                    console.log("image_200_url: " + doc.data().image_200_url)
                    setUserProfilePictureURL(doc.data().image_200_url);
                    console.log("userProfilePictureURL: " + userProfilePictureURL)
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
                setImageLoading(false);
              //   setUserDisplayName(doc.data().display_name)
              //   setUserProfilePicture(doc.data().image)
              //   setImage(userProfilePicture)             
            } 
            else 
            {
                // doc.data() will be undefined in this case
                console.log("No such document! ", userId);
            }
        })
        .catch((error) => {
            console.log("Error getting document:", error);
        });
        setLoading(false);  
    }

    // Load user's dives
  useEffect(() => {
    const unsubscribe = db
      .collection('dives')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) =>
        setDives(
          snapshot.docs.map((doc) => ({
            id: doc.id,
          }))
        )
      );
    return unsubscribe;
  }, [userId]);

  // Get image ref, download image and set for use on screen
  const setImage = (image) => {
      // Create a reference to the file we want to download
      var storageRef = storage.ref();
      var profilePicRef = storageRef.child(userId + '/' + image);
      // Get the download URL
      profilePicRef.getDownloadURL()
      .then((url) => {
          // Insert url into an <img> tag to "download"
          setUserProfilePictureURL(url)
          console.log(userProfilePictureURL)
          setImageLoading(false)
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
      { relationship == 'friends' ?
      <FlatList
        ListHeaderComponent={<View>
          <UserDetails
          displayName={userDisplayName}
          profilePic={userProfilePictureURL}
          />
          <FriendStatus
              relationship={relationship}
              friendId={userId}
              loading={true}
          />
        </View>}
        data={dives}
        renderItem={({item, index}) => (
            <DiveShort
              id={item.id}
              key={index}
              navigation={navigation}
              more={true}
              delete={false}
            /> 
        )}
        keyExtractor={item => item.id}
    /> : <View style={{flex: 1}}>
          <UserDetails
            displayName={userDisplayName}
            profilePic={userProfilePictureURL}
          />
          <FriendStatus
            relationship={relationship}
            friendId={userId}
            loading={true}
          />
        </View> }
    </>
  )
}

export default FriendScreen;