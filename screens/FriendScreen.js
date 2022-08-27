import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native'
import React, { useState, useLayoutEffect } from 'react';
import { db, auth, storage } from '../firebase';

import Icon from 'react-native-ico-material-design';
import AppStyles from '../styles/AppStyles';


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
  
    // Send notification data
    const sendNotification = (notification_type) => {
        var notification_data = {
            receiver: userId,
            sender: auth.currentUser.uid,
            type: notification_type,
            createdAt: new Date(),
        }
        db.collection("notifications")
        .add({
            ...notification_data,
        })
        .then(() => {
            console.log("Notification successfully written!");
        })
        .catch((error) => {
            console.error("Error writing notification: ", error);
        });
    }


    // Update friend status
    const friendStatusUpdate = (action) => {
        if (action === 'Add' || action === 'Accept') 
        {
            addFriend(action)
        }
        else if (action === 'Decline' || action === 'Remove') 
        {
            removeFriend()
        }
    }


    // Remove friend
    let removeFriend = async () => {
        // Delete relationship data for current user to reflect no friendship
        db.collection("friends").doc(auth.currentUser.uid).collection("relationships").doc(userId)
        .delete()
        .then(() => {
            console.log("Friend record removed for current user");
        })
        .catch((error) => {
            console.error("Error: Friend record removed for current user - ", error);
        });
        // Delete relationship data for (former) friend to reflect no friendship
        db.collection("friends").doc(userId).collection("relationships").doc(auth.currentUser.uid)
        .delete()
        .then(() => {
            console.log("Friend record removed for friend!");
        })
        .catch((error) => {
            console.error("Error: Friend record removed for friend - ", error);
        });

        setSuccessMessage('Friend removed')
        setRelationship('none')
    }

    // Add friend
    let addFriend = async (action) => {

      // Send friend request to second user if first requests friendship
      if (action === 'Add') 
      {
          setRelationship('requested')
          var currentUserStatus = {
              status: 'requested',
              createdAt: new Date(),
          }
          var secondUserStatus = {
              status: 'pending',
              createdAt: new Date(),
          }
      }
      else if (action === 'Accept') 
      {
          setRelationship('accepted')
          var currentUserStatus = {
              status: 'friends',
              createdAt: new Date(),
          }
          var secondUserStatus = {
              status: 'friends',
              createdAt: new Date(),
          }
      }
      // Reference to relationship data of current user
      let currentUserFriendRef = db.collection("friends").doc(auth.currentUser.uid).collection("relationships").doc(userId);
      // Update relationship data of current user to reflect updated state
      currentUserFriendRef.set(currentUserStatus)
      .then(() => {
          console.log("Added record for current user");
          setSuccessMessage('Current User Request Added!')
          sendNotification(action)
      })
      .catch((error) => {
          console.error("Failed to add record for current user", error);
          setErrorMessage(error.message)
          // setLoading(true)
      });
      // Reference to relationship data of second user (friend)
      // Update relationship data of second user to reflect updated state
      db.collection("friends").doc(userId).collection("relationships").doc(auth.currentUser.uid).set(secondUserStatus)
      .then(() => {
          console.log("Added record for friend");
          setSuccessMessage('Second User Pending Added!')
      })
      .catch((error) => {
          console.error("Failed to add record for friend: ", error);
          setErrorMessage(error.message)
          // setLoading(true)
      });
    };

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
      <View style={[AppStyles.container]}>
          {/* <Text>{userProfilePictureURL}</Text> */}
          {/* Show activity indicator if image is still loading */}
          {/* Otherwise show user profile picture */}
          { imageLoading ? 
              <ActivityIndicator size="large" color="#0000ff" /> : 
              <Image source={{uri: userProfilePictureURL}} style={AppStyles.profilePic} />
          }
          {/* { userProfilePictureURL &&  <Image source={{uri: userProfilePictureURL,}} style={[AppStyles.profilePic]}/> } */}
          { !imageLoading && !userProfilePictureURL &&  <Icon name='round-account-button-with-user-inside' width='100' height='100' color='gray' /> }     
      </View>
      <View style={[AppStyles.container]}>
          {/* Show user display name */}
          <Text style={[AppStyles.titleText]}>{userDisplayName} </Text>            
      </View>
      <View style={[AppStyles.container]}>
          <Text style={[AppStyles.titleText]}>{userId}</Text>
      </View>
      {/* Show button text on basis of current status of relationship */}
      <View style={[AppStyles.container]}>
          {/* If no relationship, user can request as friend */}
          {relationship === 'none' &&
          <TouchableOpacity style={{width: '40%', alignItems: 'center'}} onPress={() => friendStatusUpdate('Add')}>
              <Text style={{ fontSize: 12, borderWidth: 1, borderColor: '#CED0CE', padding: 10 }}>Add Friend</Text>
          </TouchableOpacity> }
          {/* If second user has requested friendship of current user, current user can accept or decline */}
          {relationship === 'pending' &&
          <View style={[AppStyles.section]}>
          <TouchableOpacity style={{width: '40%', alignItems: 'center'}} onPress={() => friendStatusUpdate('Accept')}>
              <Text style={{ fontSize: 12, borderWidth: 1, borderColor: '#CED0CE', padding: 10 }}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{width: '40%', alignItems: 'center'}} onPress={() => friendStatusUpdate('Decline')}>
              <Text style={{ fontSize: 12, borderWidth: 1, borderColor: '#CED0CE', padding: 10 }}>Decline</Text>
          </TouchableOpacity> 
          {/* If current user has already requested friendship, the user can take no further action */}
          </View> }
          {relationship === 'requested' &&
          <TouchableOpacity style={{width: '40%', alignItems: 'center'}} >
              <Text style={{ fontSize: 12, borderWidth: 1, borderColor: '#CED0CE', padding: 10 }}>Requested</Text>
          </TouchableOpacity> }
          {/* If users are currently friends, current user can opt to remove/end friendship */}
          {relationship === 'friends' &&
          <TouchableOpacity style={{width: '40%', alignItems: 'center'}} onPress={() => friendStatusUpdate('Remove')}>
              <Text style={{ fontSize: 12, borderWidth: 1, borderColor: '#CED0CE', padding: 10 }}>Remove Friend</Text>
          </TouchableOpacity> }
      </View>
    </>
  )
}

export default FriendScreen;