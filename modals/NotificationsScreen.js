import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import AppStyles from '../styles/AppStyles';
import { db, auth, storage } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore"; 

const NotificationsScreen = ({navigation}) => {
const [notifications, setNotifications] = useState([])
const [loading, setLoading] = useState(true)
let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const [lastViewed, setLastViewed] = useState(null)
const [errorMessage, setErrorMessage] = useState(null)
const [successMessage, setSuccessMessage] = useState(null)


React.useLayoutEffect(() => {
    const unsubscribe = navigation.setOptions({
        headerLeft: () => (
            <Text 
            onPress={()=>navigation.goBack()}
            style={AppStyles.plusButtonText}>Back</Text>
            ),
        })
    return unsubscribe
    }, [navigation, lastViewed])

    var usersRef = db.collection("users");
    var notificationsRef = db.collection("notifications");
    let lastViewedNotification = async () => {
        usersRef.doc(auth.currentUser.uid).get().then((doc) => {
            if (doc.exists) {
                doc.data().last_viewed_notification ? setLastViewed(doc.data().last_viewed_notification) : setLastViewed(new Date())
            }
            else {
                setLastViewed(new Date())
            }
        }).catch((error) => {
            console.log("let lastViewedNotification = async () => {:", error);
        });
    }
    

    let loadNotifications = async () => {
        lastViewedNotification()
        var getOptions = {
            source: 'default'
            };
        var notiRef = notificationsRef
        .where('receiver', "==", auth.currentUser.uid)
        .limit(100)
        .get(getOptions)
            .then((querySnapshot) => {
                let notifications = []
                querySnapshot.forEach((doc) => {
                    let notification = {
                        id: doc.id,
                        sender: doc.data().sender,
                        notification_type: doc.data().notification_type,
                        created_at: new Date(doc.data().createdAt.seconds*1000),
                    }
                    console.log(notification)
                    var userRef = usersRef.doc(notification.sender)
                    .get().then((user_doc) => {
                        if (user_doc.exists) {
                            notification.sender_name = user_doc.data().display_name;
                            notification.sender_imageref = user_doc.data().image;
                            // Create a reference to the file we want to show
                            var storageRef = storage.ref();
                            var profilePicRef = storageRef.child(notification.sender + '/' + notification.sender_imageref);
                            // Get the download URL
                            profilePicRef.getDownloadURL()
                            .then((url) => {
                                // Insert url into an <img> tag to "download"
                                console.log(url)
                                notification.sender_image = url
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                        } else {
                            // doc.data() will be undefined in this case
                            console.log("No such document! ", userId);
                        }
                    }).catch((error) => {
                        console.log("get().then((user_doc) => {:", error);
                    });
                    notifications.push(notification)
                })  
                
                setNotifications(notifications)
                })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });
            // setLoading(false);
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
    if (loading) {
        loadNotifications()
    }

  return (
    <View>

    { !loading && <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
            <View
            style={[AppStyles.listView, item.created_at > lastViewed ? AppStyles.unread : AppStyles.read]}>
                <Image source={{ uri: item.sender_image }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                <TouchableOpacity style={{ marginLeft: 15, width: '50%' }} onPress={() => navigation.navigate('Friend', { userId: item.id })}>
                    <Text style={{ fontSize: 16 }}>
                        {item.sender_name} {item.notification_type === 'Add' ? 'sent you a friend request' : 'accepted your friend request'}
                    </Text>
                    <Text style={{ fontSize: 12 }}>
                        {months[item.created_at.getMonth()-1]} {item.created_at.getDate()}, {item.created_at.getFullYear()} at {item.created_at.getHours()}:{item.created_at.getMinutes()}                          
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{width: '30%', alignItems: 'flex-end' }} onPress={() => navigation.navigate('Friend', { userId: item.id })}>
                    <Text style={{ fontSize: 12, borderWidth: 1, borderColor: '#CED0CE', padding: 10 }}>View Profile</Text>
                </TouchableOpacity>
            </View>
            )}
        />}
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

export default NotificationsScreen;