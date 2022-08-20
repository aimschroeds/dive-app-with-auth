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

  if (userId === auth.currentUser.uid) {
    navigation.navigate('Profile')
  }

  const goBack = () => {
    navigation.goBack();
  }

React.useLayoutEffect(() => {
    navigation.setOptions({
        headerLeft: () => (
          <Text 
            onPress={goBack}
            style={AppStyles.plusButtonText}>Back</Text>
        ),
    })
}, [navigation, relationship])

if (loading) {
  var friendRef = db.collection("friends").doc(auth.currentUser.uid);
  var relationshipRef = friendRef.collection("relationships").doc(userId);
  relationshipRef.get().then((doc) => {
    if (doc.exists) {
        setRelationship(doc.data().status)
    }
    else {
        setRelationship('none')
    }
  }).catch((error) => {
    console.log("Error getting document:", error);
});

  var userRef = db.collection("users").doc(userId);
  userRef.get().then((doc) => {
      if (doc.exists) {
          setUserDisplayName(doc.data().display_name)
          setUserProfilePicture(doc.data().image)
          setImage(userProfilePicture)
      } else {
          // doc.data() will be undefined in this case
          console.log("No such document! ", userId);
      }
  }).catch((error) => {
      console.log("Error getting document:", error);
  });

  setLoading(false);
}
  
  const sendNotification = (notification_type) => {
    var notification_data = {
        receiver: userId,
        sender: auth.currentUser.uid,
        type: notification_type,
        createdAt: new Date(),
    }
    db.collection("notifications").add({
        ...notification_data,
    })
    .then(() => {
        console.log("Document successfully written!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
}

  const friendStatusUpdate = (action) => {
    if (action === 'Add' || action === 'Accept') {
      addFriend(action)
    }
    else if (action === 'Decline' || action === 'Remove') {
      removeFriend()
    }
  }

  let removeFriend = async () => {
    db.collection("friends").doc(auth.currentUser.uid).collection("relationships").doc(userId)
    .delete()
    .then(() => {
        console.log("Document successfully deleted!");
    }).catch((error) => {
        console.error("Error removing document: ", error);
    });
    db.collection("friends").doc(userId).collection("relationships").doc(auth.currentUser.uid)
    .delete()
    .then(() => {
        console.log("Document successfully deleted!");
    }).catch((error) => {
        console.error("Error removing document: ", error);
    });
    setSuccessMessage('Friend removed')
    setRelationship('none')
  }

  let addFriend = async (action) => {
    console.log('action', action)
    if (action === 'Add') {
        console.log('add')
        setRelationship: 'requested'
        var currentUserStatus = {
            status: 'requested',
            createdAt: new Date(),
            }
        var secondUserStatus = {
            status: 'pending',
            createdAt: new Date(),
            }
        }
    else if (action === 'Accept') {
        setRelationship: 'accepted'
        var currentUserStatus = {
            status: 'friends',
            createdAt: new Date(),
            }
        var secondUserStatus = {
            status: 'friends',
            createdAt: new Date(),
            }
        }
    let currentUserFriendRef = db.collection("friends").doc(auth.currentUser.uid).collection("relationships").doc(userId);
    currentUserFriendRef.set(currentUserStatus)
    .then(() => {
        console.log("Document written");
        setSuccessMessage('Current User Request Added!')
        sendNotification(action)
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
        setErrorMessage(error.message)
        setLoading(true)
    });
    
    db.collection("friends").doc(userId).collection("relationships").doc(auth.currentUser.uid).set(secondUserStatus)
    .then(() => {
        console.log("Document written");
        setSuccessMessage('Second User Pending Added!')
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
        setErrorMessage(error.message)
        setLoading(true)
    });
  };

const setImage = (image) => {
  // Create a reference to the file we want to download
  var storageRef = storage.ref();
  var profilePicRef = storageRef.child(userId + '/' + image);
  // Get the download URL
  profilePicRef.getDownloadURL()
  .then((url) => {
    // Insert url into an <img> tag to "download"
    setUserProfilePictureURL(url)
    // console.log(userProfilePictureURL)
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
    <View style={[AppStyles.container]}>
      <Text style={[AppStyles.titleText]}>{userDisplayName} </Text>      
      
    </View>
    <View style={[AppStyles.container]}>
      <Text style={[AppStyles.titleText]}>{userId}</Text>
    </View>
    <View style={[AppStyles.container]}>
        {relationship === 'none' &&
        <TouchableOpacity style={{width: '40%', alignItems: 'center'}} onPress={() => friendStatusUpdate('Add')}>
            <Text style={{ fontSize: 12, borderWidth: 1, borderColor: '#CED0CE', padding: 10 }}>Add Friend</Text>
        </TouchableOpacity> }
        {relationship === 'pending' &&
        <View style={[AppStyles.section]}>
        <TouchableOpacity style={{width: '40%', alignItems: 'center'}} onPress={() => friendStatusUpdate('Accept')}>
            <Text style={{ fontSize: 12, borderWidth: 1, borderColor: '#CED0CE', padding: 10 }}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{width: '40%', alignItems: 'center'}} onPress={() => friendStatusUpdate('Decline')}>
            <Text style={{ fontSize: 12, borderWidth: 1, borderColor: '#CED0CE', padding: 10 }}>Decline</Text>
        </TouchableOpacity> 
        </View> }
        {relationship === 'requested' &&
        <TouchableOpacity style={{width: '40%', alignItems: 'center'}} >
            <Text style={{ fontSize: 12, borderWidth: 1, borderColor: '#CED0CE', padding: 10 }}>Requested</Text>
        </TouchableOpacity> }
        {relationship === 'friends' &&
        <TouchableOpacity style={{width: '40%', alignItems: 'center'}} onPress={() => friendStatusUpdate('Remove')}>
            <Text style={{ fontSize: 12, borderWidth: 1, borderColor: '#CED0CE', padding: 10 }}>Remove Friend</Text>
        </TouchableOpacity> }
    </View>
      </>
)
}

export default FriendScreen;