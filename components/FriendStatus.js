import {  ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { useIsFocused } from '@react-navigation/native';

import AppStyles from '../styles/AppStyles';

const FriendStatus = ({...props}) => {
    const initialRelationship = props.relationship;
    const [relationship, setRelationship] = useState(null);
    const friendId  = props.friendId;
    const inFocus = useIsFocused();
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (inFocus) {
            console.log('in focus')
            setLoading(true);
        }
    }, [inFocus, initialRelationship])

    if (loading)
    {
        setRelationship(initialRelationship);
        setLoading(false);
    }
    // useEffect(() => {
    //     setLoading(false);
    // }, [relationship])
    console.log(props, relationship, loading, initialRelationship, auth.currentUser.uid)
    // Send notification data
    const sendNotification = (notification_type) => {
        var notification_data = {
            receiver: friendId,
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
        console.log('action', action)
        if (action === 'Add' || action === 'Accept') 
        {
            console.log('add or accept')
            addFriend(action)
        }
        else if (action === 'Decline' || action === 'Remove') 
        {
            console.log('decline or remove')
            removeFriend()
        }
    }


    // Remove friend
    let removeFriend = async () => {
        // Delete relationship data for current user to reflect no friendship
        db.collection("friends").doc(auth.currentUser.uid).collection("relationships").doc(friendId)
        .delete()
        .then(() => {
            console.log("Friend record removed for current user");
        })
        .catch((error) => {
            console.error("Error: Friend record removed for current user - ", error);
        });
        // Delete relationship data for (former) friend to reflect no friendship
        db.collection("friends").doc(friendId).collection("relationships").doc(auth.currentUser.uid)
        .delete()
        .then(() => {
            console.log("Friend record removed for friend!");
        })
        .catch((error) => {
            console.error("Error: Friend record removed for friend - ", error);
        });

        // setSuccessMessage('Friend removed')
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
          setRelationship('friends')
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
    let currentUserFriendRef = db.collection("friends").doc(auth.currentUser.uid).collection("relationships").doc(friendId);
    // Update relationship data of current user to reflect updated state
    currentUserFriendRef.set(currentUserStatus)
    .then(() => {
        console.log("Added record for current user");
        // setSuccessMessage('Submit successful')
        sendNotification(action)
    })
    .catch((error) => {
        console.error("Failed to add record for current user", error);
        setErrorMessage(error.message)
        // setLoading(true)
    });
    // Reference to relationship data of second user (friend)
    // Update relationship data of second user to reflect updated state
    db.collection("friends").doc(friendId).collection("relationships").doc(auth.currentUser.uid).set(secondUserStatus)
    .then(() => {
        console.log("Added record for friend");
        // setSuccessMessage('Requested')
    })
    .catch((error) => {
        console.error("Failed to add record for friend: ", error);
        setErrorMessage(error.message)
        // setLoading(true)
    });
  };

  return (
    // /* Show button text on basis of current status of relationship */
    <View style={[AppStyles.containerColumn]}>
        <View>
        {/* Surface success/error messaging */}
        { successMessage && 
            <Text style={AppStyles.successMessage}>{successMessage}</Text>
        }
        { errorMessage && 
            <Text style={AppStyles.errorMessage}>{errorMessage}</Text>
        }
        </View>
        {/* If no relationship, user can request as friend */}
            { !loading && <View> 
            {relationship === 'none' &&
            <TouchableOpacity style={AppStyles.friendStatusButton} onPress={() => friendStatusUpdate('Add')}>
                <Text style={AppStyles.friendStatusText}>Add Friend</Text>
            </TouchableOpacity> }
            {/* If second user has requested friendship of current user, current user can accept or decline */}
            {relationship === 'pending' &&
            <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <TouchableOpacity style={AppStyles.friendStatusButton} onPress={() => friendStatusUpdate('Accept')}>
                    <Text style={AppStyles.friendStatusText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={AppStyles.friendStatusButton} onPress={() => friendStatusUpdate('Decline')}>
                    <Text style={AppStyles.friendStatusText}>Decline</Text>
                </TouchableOpacity> 
            </View> }
            {/* If current user has already requested friendship, the user can take no further action */}
            {relationship === 'requested' &&
            <TouchableOpacity style={AppStyles.friendStatusButton} >
                <Text style={AppStyles.friendStatusText}>Requested</Text>
            </TouchableOpacity> }
            {/* If users are currently friends, current user can opt to remove/end friendship */}
            {relationship === 'friends' &&
            <TouchableOpacity style={AppStyles.friendStatusButton} onPress={() => friendStatusUpdate('Remove')}>
                <Text style={AppStyles.friendStatusText}>Remove Friend</Text>
            </TouchableOpacity> }
            </View>}
            { loading && <ActivityIndicator size="large" color="black" /> }
        </View>
  )
}

export default FriendStatus