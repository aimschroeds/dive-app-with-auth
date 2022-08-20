import { ActivityIndicator, FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { db, auth, storage } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore"; 
import getFirebaseImage from '../helpers/getImage';
import AppStyles from '../styles/AppStyles';

const FindFriendsScreen = ({ route, navigation }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  var usersRef = db.collection("users");

  const updateSearch = (search) => {
    setSearch(search)
    setLoading(true)
  }

  let loadUsers = async () => {
    var getOptions = {
        source: 'default'
        };
    var searchableUsers = usersRef
    .where("searchable", "==", true)
    // .where('__name__', "!=", auth.currentUser.uid)
    .where('display_name', '>=', search)
    .limit(100)
    .get(getOptions)
        .then((querySnapshot) => {
            let eligibleUsers = []
            querySnapshot.forEach((doc) => {
                let user = {
                    id: doc.id,
                    display_name: doc.data().display_name,
                    image_url: doc.data().image,
                    // image: image,
                    created_at: doc.data().created_at,
                }
                // Create a reference to the file we want to show
                var storageRef = storage.ref();
                var profilePicRef = storageRef.child(user.id + '/' + user.image_url);
                // Get the download URL
                profilePicRef.getDownloadURL()
                .then((url) => {
                    // Insert url into an <img> tag to "download"
                    user.image = url
                })
                .catch((error) => {
                    console.log(error);
                });
                eligibleUsers.push(user) 
            })
            
            setLoading(false)
            setUsers(eligibleUsers)
            console.log(eligibleUsers)
            console.log(users)
            })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
  }


  if (loading) {
    loadUsers()
  }


  return (
    <View>
      <TextInput 
            style={[AppStyles.input]}
            onChangeText={(text) => updateSearch(text)}
            // value={search}
            placeholder="Search"
        />
        <FlatList
            data={users}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
            <View
            style={{
                flexDirection: 'row',
                padding: 16,
                alignItems: 'center'
            }}>
                <Image source={{ uri: item.image }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => navigation.navigate('Friend', { userId: item.id })}>
                    <Text style={{ fontSize: 22 }}>
                        {item.display_name}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{flex: 3, alignItems: 'flex-end' }} onPress={() => navigation.navigate('Friend', { userId: item.id })}>
                    <Text style={{ fontSize: 12, borderWidth: 1, borderColor: '#CED0CE', padding: 10 }}>View Profile</Text>
                </TouchableOpacity>
            </View>
            )}
        />
        { loading && <View
            style={{
                paddingVertical: 20,
                borderTopWidth: 1,
                borderColor: '#CED0CE'
            }}>
            <ActivityIndicator animating size='large' />
            </View> }
  </View>
  )
}

export default FindFriendsScreen
