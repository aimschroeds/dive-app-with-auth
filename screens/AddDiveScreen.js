import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Pressable, RefreshControl, StyleSheet, SafeAreaView, ScrollView, Switch, Text, TextInput, View, TouchableOpacity  } from 'react-native'
import { Cell, Section, TableView } from 'react-native-tableview-simple';
import { useNavigation } from '@react-navigation/native'
import React, { useState } from 'react';
import { db, auth } from '../firebase';
import DateTimePicker from '@react-native-community/datetimepicker';
import SearchDiveMaster from '../components/SearchDiveMaster';
import DiveMasterSelection from '../modals/DiveMasterSelection';
import AppStyles from '../styles/AppStyles';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore"; 
import Icon from 'react-native-ico-material-design';
import DiveLocationModal from '../modals/DiveLocationModal';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import AddBuddyModal from '../modals/AddBuddy';

const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}


// Cancel button; when hit returns user to home
const AddDiveScreen = ( {navigation }) => {
    
    const cancelAddDive = () => {
        navigation.navigate('Home')
      }

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
              <Text 
                onPress={cancelAddDive}
                style={AppStyles.plusButtonText}>Cancel</Text>
            ),
        })
    }, [navigation])

    // Constants capturing dive data
    const [dives, setDives] = useState([]);
    const [diveLocation, setDiveLocation] = useState({});
    const [diveStart, setDiveStart] = useState(new Date());
    const [diveEnd, setDiveEnd] = useState(new Date());
    const [diveCenter, setDiveCenter] = useState(null);
    const [diveMaster, setDiveMaster] = useState(null);
    const [buddies, setBuddies] = useState([]);
    const [surfaceInterval, setSurfaceInterval] = useState('');
    const [startPressure, setStartPressure] = useState('');
    const [endPressure, setEndPressure] = useState('');
    const [maxDepth, setMaxDepth] = useState('');

    // Constants enabling management of search Modals for various fields
    const [diveCenterSearchModalVisible, setDiveCenterSearchModalVisible] = useState(false);
    const [diveMasterSearchModalVisible, setDiveMasterSearchModalVisible] = useState(false);
    const [diveLocationModalVisible, setDiveLocationModalVisible] = useState(false);
    const [diveBuddyModalVisible, setDiveBuddyModalVisible] = useState(false);

    // Constants for managing user status
    const [userNotVerified, setUserNotVerified] = useState(!auth.currentUser.emailVerified);

    // Constants for managing messaging to user
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Constants managing state of screen
    const [refreshing, setRefreshing] = React.useState(false);

    
    // https://reactnative.dev/docs/refreshcontrol
    // Enables user to be able to reload screen every 2000 ms
    const onRefresh = React.useCallback(() => {
      setRefreshing(true);
      wait(2000).then(() => setRefreshing(false));
    }, []);


    // Set dive start time
    const onChangeStart = (event, selectedTime) => {
      const currentSelectedTime = selectedTime;
      setDiveStart(currentSelectedTime);
    };


    // Set dive end time
    const onChangeEnd = (event, selectedDate) => {
      const currentSelectedDate = selectedDate;
      setDiveEnd(currentSelectedDate);
    };


    // Send user verification email 
    // Prevent users from adding dives if not verified user (prevent spam)
    const sendVerificationEmail = () => {
      auth.currentUser.sendEmailVerification()
      .then(() => {
          setSuccessMessage('Verification email sent!')
      }).catch(error => {
          setErrorMessage(error.message)
      }
      )
  }
    

  // Add dive to "dives" collection in Firebase
    let addDive = async () => {
      let dive = {
        diveSite: diveLocation.id,
        diveStart: diveStart,
        diveEnd: diveEnd,
        diveCenter: diveCenter,
        diveMaster: diveMaster,
        surfaceInterval: surfaceInterval,
        startPressure: {value: Number(startPressure), dimension: 'bar'},
        endPressure: {value: Number(endPressure), dimension: 'bar'},
        maxDepth: {value: Number(maxDepth), dimension: 'meter'},
        userId: auth.currentUser.uid,
        createdAt: new Date(),
      }
      db.collection("dives").add(dive)
      .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
          setSuccessMessage('Dive added!')
          navigation.navigate('Home')
      })
      .catch((error) => {
          console.error("Error adding document: ", error);
          setErrorMessage(error.message)
      });
    };

  return (
    <SafeAreaView style={{backgroundColor: 'white'}}>  
      <ScrollView style={{height:"100%"}} 
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <KeyboardAvoidingView
          // style={AppStyles.loginContainer}
          behavior="padding"
          style={{marginHorizontal: 20}}
        >
          {/* If dive location is set, show map with pin on dive site */}
          { diveLocation.name && <MapView
              style={[AppStyles.smallMap]}
              region={{
              latitude: diveLocation.latitude,
              longitude: diveLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
              }}
              onPress={() => setDiveLocationModalVisible(true)}
            >
              <Marker
                  key={diveLocation.id}
                  coordinate={{ latitude: diveLocation.latitude, longitude: diveLocation.longitude }}
                  title={diveLocation.name}
              />
          </MapView> }
          {/* Unverified users receive prompt to verify their email address */}
          {userNotVerified && <Text style={AppStyles.errorMessage}>To Log A Dive, Please Verify Your Email</Text>
          }
          {userNotVerified && <TouchableOpacity style={AppStyles.loginButton} onPress={sendVerificationEmail}>
              <Text style={AppStyles.loginButtonText}>Send Verification Email</Text>
          </TouchableOpacity> }

          {/* Surface success/error messaging */}
          {successMessage && <Text style={AppStyles.successMessage}>{successMessage}</Text>}
          {errorMessage && <Text style={AppStyles.errorMessage}>{errorMessage}</Text>}

          {/* Dev purposes only TODO: Remove */}
          <Text>Email: {auth.currentUser?.email}</Text>
          <Text>UUID: {auth.currentUser?.uid}</Text>

          {/* Capture dive data */}
          {/* Dive Location Data */}
          <View style={AppStyles.container}>
            {/* Add Dive Site: Opens modal where user can select or add new dive site location */}
            <TouchableOpacity style={[AppStyles.buttonBlue, AppStyles.section]} 
              onPress={() => setDiveLocationModalVisible(true)}
            >
              <Icon name="searching-location-gps-indicator" height='20' width='20' color="white"/>
              {/* If Dive Location is set, then show name of dive site. Otherwise prompt user to add data */}
              { diveLocation.name ? <Text style={AppStyles.locationButtonText}>{diveLocation.name}</Text> : 
                                    <Text style={AppStyles.locationButtonText}>Add Dive Site</Text> }         
            </TouchableOpacity>
              {/* Dive site location modal */}
                <Modal
                    animationType="slide"
                    presentationStyle="pageSheet"
                    visible={diveLocationModalVisible}
                    onRequestClose={() => {
                      setDiveLocationModalVisible(!diveLocationModalVisible);
                    }}>
                  <DiveLocationModal 
                    onClose={() => setDiveLocationModalVisible(false)}
                    onSelect={(loc) => {setDiveLocation(loc)}}
                    selectedLocation={diveLocation}
                  />
                </Modal>
            {/* Set Dive Region: Auto set on basis of Dive Site (opens dive site modal from above) */}
            <TouchableOpacity style={[AppStyles.buttonBlue, AppStyles.section]}
              onPress={() => setDiveLocationModalVisible(true)}
            >
              <Icon name="location-arrow" height='20' width='20' color="white"/>
              {/* If Dive Location is set, then show region of dive site. Otherwise prompt user to add data */}
              { diveLocation.name ? <Text style={AppStyles.locationButtonText}>{diveLocation.location.region}</Text> : 
                                    <Text style={AppStyles.locationButtonText}>Region</Text> }
            </TouchableOpacity>
          </View>
          {/* Dive Profile Section: Mimics layout of dive profile in analog diver logbooks */}
          <View style={styles.diverProfile}>
            <View style={styles.diverProfileHeader}>
              <Image
                style={styles.smallIcon}
                source={require('../assets/coral.png')}
              />
              <Text style={styles.diverProfileText}>Dive Profile</Text>
              <Image
                style={styles.smallIcon}
                source={require('../assets/diver.png')}
              />
            </View>
            <Image
                style={styles.wave}
                source={require('../assets/wave-long.png')}
              />
            {/* Dive profile: Data fields */}
            <View style={styles.diverProfileBody}>
              <View style={styles.diverProfileBodyContents}>
              {/* Row: Surface Interval data*/}
              <View style={[styles.diverProfileBodyRow, styles.leftAlignedRow, {marginLeft: -10}]}>
                <Text style={styles.diverProfileBodyText}>Surface Interval: </Text>
                <TextInput 
                  style={styles.diverProfileBodyInput} 
                  onChangeText={setSurfaceInterval}
                  value={surfaceInterval}
                />
                <Text style={styles.diverProfileBodyMeasure}>minutes</Text>
              </View>
              {/* Row: Start and End pressure */}
              <View style={styles.diverProfileBodyRow}>
                {/* Column */}
                <View style={styles.diverProfileBodyColumn}>
                  {/* Start pressure data */}
                  <View style={[styles.diverProfileBodyRow]}>
                    <Text style={styles.diverProfileBodyText}>Start: </Text>
                    <TextInput 
                      style={styles.diverProfileBodyInput} 
                      onChangeText={setStartPressure}
                      value={startPressure}
                      placeholder="200"
                    />
                    <Text style={styles.diverProfileBodyMeasure}>bar</Text>
                  </View>
                </View>
                {/* Column (intentionally blank) */}
                <View style={[styles.diverProfileBodyColumn]}>            
                </View>
                {/* Column */}
                <View style={styles.diverProfileBodyColumn}>
                  {/* End pressure data */}
                  <View style={[styles.diverProfileBodyRow]}>
                    <Text style={styles.diverProfileBodyText}>End: </Text>
                    <TextInput 
                      style={styles.diverProfileBodyInput} 
                      onChangeText={setEndPressure}
                      value={endPressure}
                      placeholder="50"
                    />
                    <Text style={styles.diverProfileBodyMeasure}>bar</Text>
                  </View>
                </View>
              </View>
              {/* Image for dive profile */}
              <View style={styles.diverProfileBodyRow}>
                <Image
                  style={styles.diveProfileImage}
                  source={require('../assets/dive-profile.png')}
                />
              </View>
              {/* Column (centred) */}
              <View style={[styles.diverProfileBodyRow, styles.centerAlignedRow]}>
                {/* Max depth data */}
                <Text style={styles.diverProfileBodyText}>Depth: </Text>
                <TextInput 
                  style={styles.diverProfileBodyInput} 
                  onChangeText={setMaxDepth}
                  value={maxDepth}
                  placeholder="0"
                />
                <Text style={styles.diverProfileBodyMeasure}>m</Text>
              </View>
            </View>
          </View>
        </View>
        <TableView>
          <Section hideSeparator>
            {/* Dive start time */}
            <Cell
                cellAccessoryView={<DateTimePicker 
                  testID="datePicker"
                  style={styles.datePicker}
                  maximumDate={new Date()} 
                  mode="datetime"
                  value={diveStart}
                  onChange={onChangeStart}
                />}
                title="Time In"
                titleTextColor={'#413FEB'}
                titleTextStyle={styles.cellTitleText}
                hideSeparator={true}
                cellStyle="RightDetail"
              >
            </Cell>
            {/* Dive end time */}
            <Cell
                cellAccessoryView={<DateTimePicker 
                  testID="datePicker"
                  style={styles.datePicker}
                  maximumDate={new Date()} 
                  mode="datetime"
                  minimumDate={diveStart}
                  value={diveEnd}
                  onChange={onChangeEnd}
                />}
                title="Time Out"
                titleTextColor={'#413FEB'}
                titleTextStyle={styles.cellTitleText}
                hideSeparator={true}
                // cellStyle="RightDetail"
              >
            </Cell>
            {/* Dive buddy search */}
            <Cell
              cellStyle="RightDetail"
              accessory="DisclosureIndicator"
              title="Dive Buddies"
              detail={buddies}
              titleTextColor={'#413FEB'}
              titleTextStyle={styles.cellTitleText}
              hideSeparator={true}
              onPress={() => setDiveBuddyModalVisible(true)}
            />
            {/* Dive master search */}
            <Cell
              cellStyle="RightDetail"
              accessory="DisclosureIndicator"
              title="Dive Master"
              detail={diveMaster}
              titleTextColor={'#413FEB'}
              titleTextStyle={styles.cellTitleText}
              hideSeparator={true}
              onPress={() => setDiveMasterSearchModalVisible(true)}
            />
          </Section>
        </TableView>  
        <View style={AppStyles.centeredView}>
          {/* Dive center search modal */}
          {/* <Modal
            animationType="slide"
            // transparent={true}
            presentationStyle="pageSheet"
            visible={diveCenterSearchModalVisible}
            onRequestClose={() => {
              setDiveCenterSearchModalVisible(!diveCenterSearchModalVisible);
            }}>
            
          </Modal> */}
          {/* Dive master search modal */}
          <Modal
            animationType="slide"
            // transparent={true}
            presentationStyle="pageSheet"
            visible={diveMasterSearchModalVisible}
            onRequestClose={() => {
              setDiveMasterSearchModalVisible(!diveMasterSearchModalVisible);
            }}>
            <DiveMasterSelection 
              // onClose={(text) => setDiveMasterSearchModalVisible(false)}
              onClose={(text) => console.log(text)}
              onSelect={(diveMaster) => {setDiveMaster(diveMaster)}}
            />
          </Modal>
          {/* Dive buddy search modal */}
          <Modal
            animationType="slide"
            // transparent={true}
            presentationStyle="pageSheet"
            visible={diveBuddyModalVisible}
            onRequestClose={() => {
              setDiveBuddyModalVisible(!diveBuddyModalVisible);
            }}>
            <AddBuddyModal
              onClose={() => setDiveBuddyModalVisible(false)}
              onSelect={(buddies) => setBuddies(buddies)}
            />
          </Modal>
        </View>

        {/* Add Dive Button --> Submits dive to database */}
        <TouchableOpacity 
          style={AppStyles.button} 
          onPress={addDive} 
          disable={userNotVerified ? true : false}>
          <Text style={AppStyles.buttonText}>Log Dive</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </ScrollView>    
  </SafeAreaView>
    
    
  )
}

export default AddDiveScreen

const styles = StyleSheet.create({
  // centeredView: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginTop: 22,
  // },
  // scrollContainer: {
  //   flex: 1,
  // },
  searchBar: {
    // flex: 1,
    // alignItems: 'center',
    width: '95%',
  },
  // button: {
  //   borderRadius: 20,
  //   padding: 10,
  //   elevation: 2,
  // },
  // buttonOpen: {
  //   backgroundColor: '#F194FF',
  // },
  // buttonClose: {
  //   backgroundColor: '#2196F3',
  // },
  // textStyle: {
  //   color: 'white',
  //   fontWeight: 'bold',
  //   textAlign: 'center',
  // },
  // modalText: {
  //   marginBottom: 15,
  //   textAlign: 'center',
  // },  
  // plusButtonText: {
  //       color: '#00b5ec',
  //       paddingLeft: 10,
  //   },
    // container: {
    //     flex: 1,
    //     flexDirection: 'row',
    //     justifyContent: 'center',
    //     alignContent: 'space-between',
    //     marginTop: 30,
    // },
    textInput: {
      height: 30,
      marginVertical: 12,
      padding: 10,
      paddingHorizontal: 15,
      borderRadius: 15,
      backgroundColor: '#413FEB',
      color: 'white',
      width: '45%',
      textAlign: 'center',
      marginHorizontal: '3%',
    },

    dateInput: {
      height: 30,
      marginVertical: 12,
      padding: 10,
      // borderRadius: 15,
      // backgroundColor: '#413FEB',
      // textColor: 'white',
      width: '95%',
      marginHorizontal: '3%',
      // textAlign: 'left',
      alignContent: 'right',
      // justifyContent: 'center',
      alignItems: 'flex-end',
    },
    datePicker: {
      // margin:-2,
      // borderWidth: 1,
      width: '80%',
      // alignSelf: 'flex-end',
    },
    diverProfile: {
      marginVertical: 20,
      borderColor: '#DDDDDD',
      borderWidth: 1,
      borderRadius: 16,
      // marginTop: 30,
    },
    diverProfileHeader: {
      flexDirection: 'row',
      flex: 1,
      justifyContent: 'center',
      marginTop: 20,
    },
    diverProfileText: {
      fontSize: 16,
      color: '#413FEB',
      marginHorizontal: 10,
      fontFamily: 'Helvetica',
    },
    cellTitleText: {
      fontSize: 14,
      fontFamily: 'Helvetica',
      fontWeight: 'bold',
    },
    smallIcon: {
      width: 20,
      height: 20,
      paddingTop: 5,
    },
    wave: {
      marginTop: 20,
    },
    diverProfileBody: {
      backgroundColor: '#EBF6FA',
      marginTop: -15,
      paddingTop: 15,
      flex: 1, 
      
      // flexDirection: 'column',     
    },
    diverProfileBodyContents: {
      marginHorizontal: 30,
    },
    diverProfileBodyRow: {
      flexDirection: 'row',
      // justifyContent: 'space-between',
      // marginHorizontal: 30,
      marginBottom: 10,
      width: '100%',
      flex: 1,
      alignSelf: 'center',
      justifyContent: 'space-around',
    },
    leftAlignedRow: {
      justifyContent: 'flex-start',
    },
    centerAlignedRow: {
      justifyContent: 'center',
      marginTop: -20,
    },
    leftAlignedText:{
      textAlign: 'left',
    },
    diverProfileBodyColumn: {
      flexDirection: 'column',
      flex: 1,
      width: '100%',
      alignItems: 'stretch',
    },
    diverProfileBodyText: {
      color: '#413FEB',
      fontWeight: 'bold',
    },
    diverProfileBodyInput: {
      color: '#626262',
      marginHorizontal: 5,
      borderBottomColor: '#626262',
      borderBottomWidth: 1,
      width: 40,
    },
    diveProfileImage: {
      alignSelf: 'stretch',
      marginTop: -10,
    },
})