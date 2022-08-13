import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import AppStyles from '../styles/AppStyles'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Cell, Section, TableView } from 'react-native-tableview-simple';
import { useNavigation } from '@react-navigation/native'
import LoginScreen from './LoginScreen';
import Icon from 'react-native-ico-material-design';
import { db, auth, storage } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore"; 
import App from '../App';

const UserStack = createNativeStackNavigator();

const ProfileScreen = () => {
  const [userFirstName, setUserFirstName] = React.useState(null)
  const [userLastName, setUserLastName] = React.useState(null)
  const [userProfilePicture, setUserProfilePicture] = React.useState(null)
  const [userProfilePictureURL, setUserProfilePictureURL] = React.useState(null)

  var docRef = db.collection("users").doc(auth.currentUser?.uid);

  docRef.get().then((doc) => {
      if (doc.exists) {
          setUserFirstName(doc.data().first_name)
          setUserLastName(doc.data().last_name)
          setUserProfilePicture(doc.data().image_ref)
          setImage(userProfilePicture)
          console.log("Document data:", doc.data());
      } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
      }
  }).catch((error) => {
      console.log("Error getting document:", error);
  });

const setImage = (image) => {
  // Create a reference to the file we want to download
  var storageRef = storage.ref();
  var profilePicRef = storageRef.child('profile_pictures/' + image);
  console.log("telllll meeeee: ", profilePicRef.getDownloadURL())
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
      { !userProfilePictureURL &&  <Text>WHAT: {userProfilePictureURL}</Text> }     
    </View>
    <View style={[AppStyles.section]}>
      <Text style={[AppStyles.titleText]}>{userFirstName} </Text>
      <Text style={[AppStyles.titleText]}>{userLastName}</Text>
    </View>
    <TableView>
    <Text> {auth.currentUser?.email}</Text>
      <Section>
        <Cell cellStyle="Basic" title="First Name" accessory="Detail" onPress={() => {} }>
        </Cell>
        <Cell cellStyle="RightDetail"
              title="Last Name"
              detail={userLastName}
              onPress={() => {} }>
        </Cell>
      </Section>
    </TableView>
    { userFirstName && <View style={AppStyles.container}>
      <TextInput
          style={AppStyles.textInput}
          onChangeText={setUserFirstName}
          value={userFirstName}
          placeholder="First Name"
          placeholderTextColor={'black'}
        />
        <TouchableOpacity style={{padding: 15, flexDirection: 'row', borderRadius: 15, marginRight: 3, borderWidth: 2, justifyContent: 'center', borderColor: '#413FEB', backgroundColor: 'white'}} >
            <Icon name='save-button' height='18' color='#413FEB' />
            <Text style={{ marginLeft: 10, color: '#413FEB', fontWeight: 'bold', fontSize: 18}}>Save</Text>
        </TouchableOpacity>
      </View> }
      { !userFirstName && <View style={AppStyles.container}>
      <TextInput
        style={AppStyles.textInput}
        onChangeText={setUserFirstName}
        value={userFirstName}
        placeholder="First Name"
        placeholderTextColor={'black'}
      />
      <TouchableOpacity style={{padding: 15, flexDirection: 'row', borderRadius: 15, marginRight: 3, borderWidth: 2, justifyContent: 'center', borderColor: '#413FEB', backgroundColor: 'white'}} >
          <Icon name='save-button' height='18' color='#413FEB' />
          <Text style={{ marginLeft: 10, color: '#413FEB', fontWeight: 'bold', fontSize: 18}}>Save</Text>
      </TouchableOpacity>
      </View> }
      </>)
}

export default ProfileScreen

const styles = StyleSheet.create({})