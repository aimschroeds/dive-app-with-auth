import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { db, auth, storage } from '../firebase';

import AppStyles from '../styles/AppStyles';

const NotificationsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const [lastViewed, setLastViewed] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)
    const inFocus = useIsFocused();

    // When user returns to view, reload data
    useEffect (() => {
        if (inFocus && loading)
        {
            setLoading(true);
            // loadNotifications();
        }
    }, [inFocus, loading]);


    // Add back button to header
    useLayoutEffect(() => {
        const unsubscribe = navigation.setOptions({
            headerLeft: () => (
                <Text 
                onPress={()=>navigation.goBack()}
                style={AppStyles.plusButtonText}>Back</Text>
                ),
            })
        return unsubscribe
        }, [navigation, lastViewed])


    // Reference to users in firebase db
    var usersRef = db.collection("users");
    // Reference to notifications in firebase db
    var notificationsRef = db.collection("notifications");

    
    // Get and/or set date and time for when user last viewed notifications 
    let lastViewedNotification = async () => {
        usersRef.doc(auth.currentUser.uid).get().then((doc) => {
            if (doc.exists) 
            {
                doc.data().last_viewed_notification ? setLastViewed(doc.data().last_viewed_notification) : setLastViewed(new Date())
            }
            else 
            {
                setLastViewed(new Date())
            }
        })
        .catch((error) => {
            console.log("lastViewedNotification:Error ", error);
        });
    }
    

    // Load notifications 
    let loadNotifications = async () => {
        lastViewedNotification()
        var getOptions = {
            source: 'default'
        };

        // Get notifications
        var notiRef = notificationsRef
        .where('receiver', "==", auth.currentUser.uid)
        .orderBy('createdAt', 'desc')
        // TO DO: Remove limit
        .limit(100)
        .get(getOptions)
        .then((querySnapshot) => {
            let notifications = []
            querySnapshot.forEach((doc) => {
                let notification = {
                    id: doc.id,
                    sender: doc.data().sender,
                    type: doc.data().type,
                    created_at: new Date(doc.data().createdAt.seconds*1000),
                }
                // Get user data to surface alongside notification
                var userRef = usersRef.doc(notification.sender)
                .get()
                .then((user_doc) => {
                    if (user_doc.exists) {
                        notification.sender_name = user_doc.data().display_name;
                        if (user_doc.data().image_200_url)
                        {
                            notification.sender_image = user_doc.data().image_200_url;
                        }
                        else 
                        {
                            notification.sender_imageref = user_doc.data().image;
                            // Create a reference to the file we want to show
                            var storageRef = storage.ref();
                            var profilePicRef = storageRef.child(notification.sender + '/' + notification.sender_imageref);
                            // Get the download URL
                            profilePicRef.getDownloadURL()
                            .then((url) => {
                                // Insert url into an <img> tag to "download"
                                notification.sender_image = url
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                        }                           
                    } 
                    else 
                    {
                        // doc.data() will be undefined in this case
                        console.log("No such document! ", userId);
                    }
                }).catch((error) => {
                    console.log("get().then((user_doc) => {:", error);
                }).finally(() => {
                    notifications.push(notification)
                    setNotifications(notifications)
                    setLoading(false)
                });
            })  
            
            setNotifications(notifications)
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
        // setLoading(false);
        // Update last viewed to current time
        usersRef.doc(auth.currentUser.uid).set({
            last_viewed_notification: new Date(),
        }, { merge: true })
        .then(() => {
            console.log("Document written");
            setSuccessMessage('New notification date last viewed set!')
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
            setErrorMessage(error.message)
            // setLoading(true)
        });
        setLoading(false)
    }

    // loadNotifications();    
    if (loading) 
    {
        loadNotifications();
    }

  return (
    <View>
        {/* When loading complete, show list of notifications */}
        { notifications && <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
            <View
            style={[AppStyles.listView, item.created_at > lastViewed ? AppStyles.unread : AppStyles.read]}>
                {/* Profile picture of sender of notification */}
                <Image source={{ uri: item.sender_image }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                {/* Navigate to friend profile on press */}
                <TouchableOpacity style={{ marginLeft: 15, width: '50%' }} onPress={() => navigation.navigate('Friend', { userId: item.sender })}>
                    {/* Notification text on basis of notification type */}
                    <Text style={{ fontSize: 16 }}>
                        {item.sender_name} {item.type === 'Add' ? 'sent you a friend request' : 'accepted your friend request'}
                    </Text>
                    {/* Date and time of notification being sent */}
                    <Text style={{ fontSize: 12 }}>
                        {months[item.created_at.getMonth()-1]} {item.created_at.getDate()}, {item.created_at.getFullYear()} at {item.created_at.getHours()}:{item.created_at.getMinutes()}                          
                    </Text>
                </TouchableOpacity>
                {/* Button to view friend profile */}
                <TouchableOpacity style={{width: '30%', alignItems: 'flex-end' }} onPress={() => navigation.navigate('Friend', { userId: item.sender })}>
                    <Text style={{ fontSize: 12, borderWidth: 1, borderColor: '#CED0CE', padding: 10 }}>View Profile</Text>
                </TouchableOpacity>
            </View>
            )}
        />}
        {/* Show loading indicator */}
        { !notifications && <View
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

export default NotificationsScreen;