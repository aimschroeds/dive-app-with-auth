import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { db, auth, storage } from '../firebase';

import Icon from 'react-native-ico-material-design';
import AppStyles from '../styles/AppStyles';
import DiveShort from '../components/DiveShort';
import UserDetails from '../components/UserDetails';
import LogoutButton from '../components/LogoutButton';


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
    const [dives, setDives] = useState([]);
    const scrollRef = useRef();

    // Show edit button in header
    useLayoutEffect(() => {
        const unsubscribe = navigation.setOptions({
            headerRight: () => (
            <TouchableOpacity
                onPress={showEdit}
                style={AppStyles.headerButton}
              >
              <Icon name="create-new-pencil-button" height='20' width='20' color="#413FEB" />
            </TouchableOpacity>
            ),
        });
        return unsubscribe;
    }, [navigation])
    
    
    // https://stackoverflow.com/questions/31883211/scroll-to-top-of-scrollview
    // Scroll to top of screen
    const goToTop = () => {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    }

    // When user returns to screen, reload data
    useEffect(() => {
        goToTop();
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
      console.log(dives)
    return unsubscribe;
  }, [userId]);
  
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
    <FlatList
        ListHeaderComponent={<View><UserDetails
          displayName={userDisplayName}
          profilePic={userProfilePictureURL}
        /><LogoutButton/></View>}
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
    />
      </>
)
}

export default ProfileScreen;