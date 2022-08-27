import { ActivityIndicator, FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react';

import { db, auth, storage } from '../firebase';

import AppStyles from '../styles/AppStyles';

/**
 * Enable user to search users
 * @param {*} route
 * @param {*} navigation 
 * @returns 
 */

const FindFriendsScreen = ({ route, navigation }) => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    

    // Reference to users db in firebase
    var usersRef = db.collection("users");


    // Update search to reflect term input by user
    const updateSearch = (search) => {
        setSearch(search)
        setLoading(true)
    }

    // Load users from database
    let loadUsers = async () => {
        var getOptions = {
            source: 'default'
        };
        // TO DO: Check if wheres on different fields is actually effective
        var searchableUsers = usersRef
        .where("searchable", "==", true)
        .where('display_name', '>=', search)
        // TO DO: Remove limit
        .limit(100)
        .get(getOptions)
        .then((querySnapshot) => {
            let eligibleUsers = []
            querySnapshot.forEach((doc) => {
                // Make sure we don't add current user as potential friend
                if (doc.id != auth.currentUser.uid) 
                {
                    // Set user data from db
                    let user = {
                        id: doc.id,
                        display_name: doc.data().display_name,
                        image_url: doc.data().image_200_url,
                        image: doc.data().image,
                        created_at: doc.data().created_at,
                        loading: true,
                    }
                    // Get image url of friend profile picture
                    if (!user.image_url)
                    {
                        // Create a reference to the file we want to show
                        var storageRef = storage.ref();
                        var profilePicRef = storageRef.child(user.id + '/' + user.image);
                        // Get the download URL
                        profilePicRef.getDownloadURL()
                        .then((url) => {
                            // Insert url into an <img> tag to "download"
                            user.image_url = url
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                    }
                    eligibleUsers.push(user) 
                    user.loading = false
                }
            })
            setLoading(false)
            setUsers(eligibleUsers)
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
                }}
            >
                {/* While row is loading show activity indicator */}
                { item.loading && <ActivityIndicator size="small" color="#00ff00" /> }
                {/* When row is loaded, show user profile picture and display name */}
                { !item.loading && 
                    <Image source={{ uri: item.image_url }} style={{ width: 50, height: 50, borderRadius: 25 }} /> 
                }
                {/* Go to friend profile page if pressed */}
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
