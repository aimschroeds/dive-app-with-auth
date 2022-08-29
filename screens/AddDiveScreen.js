import { Image, KeyboardAvoidingView, Modal, RefreshControl, StyleSheet, SafeAreaView, 
          ScrollView, Text, TextInput, View, TouchableOpacity  } from 'react-native';

import React, { useState, useLayoutEffect } from 'react';

import { db, auth } from '../firebase';

import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';

import DiveMasterSelection from '../modals/DiveMasterSelection';
import DiveLocationModal from '../modals/DiveLocationModal';
import AddBuddyModal from '../modals/AddBuddy';
import MultiImageUploader from '../modals/MultiImageUploader';

import { Cell, Section, TableView } from 'react-native-tableview-simple';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-ico-material-design';
import AppStyles from '../styles/AppStyles';


// Configure wait to prevent reloading page too often
const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

/**
 * Screen for logging dive
 * @param {*} navigation 
 * @returns {JSX.Element}
 */
const AddDiveScreen = ( {navigation }) => {
  // Constants capturing dive data
  // TO DO: Refactor to use object?
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
  const [trainingDive, setTrainingDive] = useState(false);
  const [images, setImages] = useState([]);
  const [temperature, setTemperature] = useState(25);
  const [visibility, setVisibility] = useState(10);
  const [sky, setSky] = useState('');
  const [waves, setWaves] = useState('');
  const [saltwater, setSaltwater] = useState(true);
  const [entry, setEntry] = useState('Shore');
  const [notes, setNotes] = useState('');


  // Constants enabling management of search Modals for various fields
  const [diveCenterSearchModalVisible, setDiveCenterSearchModalVisible] = useState(false);
  const [diveMasterSearchModalVisible, setDiveMasterSearchModalVisible] = useState(false);
  const [diveLocationModalVisible, setDiveLocationModalVisible] = useState(false);
  const [diveBuddyModalVisible, setDiveBuddyModalVisible] = useState(false);
  const [imagePickerModalVisible, setImagePickerModalVisible] = useState(false);

  // Constants for managing user status
  const [userNotVerified, setUserNotVerified] = useState(!auth.currentUser.emailVerified);

  // Constants for managing messaging to user
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Constants managing state of screen
  const [refreshing, setRefreshing] = useState(false);

  // Cancel button; when hit returns user to home
    const cancelAddDive = () => {
        navigation.navigate('Home')
    }
    
    // Set header to contain cancel button
    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
              <Text 
                onPress={cancelAddDive}
                style={AppStyles.plusButtonText}>Cancel</Text>
            ),
        })
    }, [navigation])
    
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
        })
        .catch(error => {
            setErrorMessage(error.message)
        })
    }
    

  // Add dive to "dives" collection in Firebase
    let addDive = async () => {
        let dive = {
          diveSite: diveLocation.id,
          buddies: buddies,
          diveProfile: {
            diveStart: diveStart,
            diveEnd: diveEnd,
            surfaceInterval: surfaceInterval,
            startPressure: {value: Number(startPressure), dimension: 'bar'},
            endPressure: {value: Number(endPressure), dimension: 'bar'},
            maxDepth: {value: Number(maxDepth), dimension: 'meter'},
          },
          trainingDive: trainingDive,
          images: images,
          conditions: {
            temperature: {value: Number(temperature), dimension: 'celsius'},
            visibility: {value: Number(visibility), dimension: 'meter'},
            sky: sky,
            waves: waves,
            saltwater: saltwater,
            entry: entry,
          },
          notes: notes,
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
                  {/* Pin showing dive location */}
                  <Marker
                      key={diveLocation.id}
                      coordinate={{ latitude: diveLocation.latitude, longitude: diveLocation.longitude }}
                      title={diveLocation.name}
                  />
              </MapView> }
              {/* Unverified users receive prompt to verify their email address */}
              { userNotVerified && 
                  <Text style={AppStyles.errorMessage}>To Log A Dive, Please Verify Your Email</Text>
              }
              { userNotVerified && 
                  <TouchableOpacity style={AppStyles.loginButton} onPress={sendVerificationEmail}>
                      <Text style={AppStyles.loginButtonText}>Send Verification Email</Text>
                  </TouchableOpacity> 
              }
              {/* Surface success/error messaging */}
              { successMessage && 
                  <Text style={AppStyles.successMessage}>{successMessage}</Text>
              }
              { errorMessage && 
                  <Text style={AppStyles.errorMessage}>{errorMessage}</Text>
              }
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
              <View style={AppStyles.diverProfile}>
                  <View style={AppStyles.diverProfileHeader}>
                      <Image
                        style={AppStyles.smallIcon}
                        source={require('../assets/coral.png')}
                      />
                      <Text style={AppStyles.diverProfileText}>Dive Profile</Text>
                      <Image
                        style={AppStyles.smallIcon}
                        source={require('../assets/diver.png')}
                      />
                  </View>
                  <Image
                      style={AppStyles.wave}
                      source={require('../assets/wave-long.png')}
                  />
                  {/* Dive profile: Data fields */}
                  <View style={AppStyles.diverProfileBody}>
                      <View style={AppStyles.diverProfileBodyContents}>
                          {/* Row: Surface Interval data*/}
                          <View style={[AppStyles.diverProfileBodyRow, AppStyles.leftAlignedRow, {marginLeft: -10}]}>
                              <Text style={AppStyles.diverProfileBodyText}>Surface Interval: </Text>
                              <TextInput 
                                style={AppStyles.diverProfileBodyInput} 
                                onChangeText={setSurfaceInterval}
                                value={surfaceInterval}
                              />
                              <Text style={AppStyles.diverProfileBodyMeasure}>minutes</Text>
                          </View>
                          {/* Row: Start and End pressure */}
                          <View style={AppStyles.diverProfileBodyRow}>
                              {/* Column */}
                              <View style={AppStyles.diverProfileBodyColumn}>
                                  {/* Start pressure data */}
                                  <View style={[AppStyles.diverProfileBodyRow]}>
                                    <Text style={AppStyles.diverProfileBodyText}>Start: </Text>
                                    <TextInput 
                                      style={AppStyles.diverProfileBodyInput} 
                                      onChangeText={setStartPressure}
                                      value={startPressure}
                                      placeholder="200"
                                    />
                                    <Text style={AppStyles.diverProfileBodyMeasure}>bar</Text>
                                  </View>
                              </View>
                              {/* Column (intentionally blank) */}
                              <View style={[AppStyles.diverProfileBodyColumn]}>            
                              </View>
                              {/* Column */}
                              <View style={AppStyles.diverProfileBodyColumn}>
                                {/* End pressure data */}
                                  <View style={[AppStyles.diverProfileBodyRow]}>
                                      <Text style={AppStyles.diverProfileBodyText}>End: </Text>
                                      <TextInput 
                                        style={AppStyles.diverProfileBodyInput} 
                                        onChangeText={setEndPressure}
                                        value={endPressure}
                                        placeholder="50"
                                      />
                                      <Text style={AppStyles.diverProfileBodyMeasure}>bar</Text>
                                  </View>
                              </View>
                        </View>
                        {/* Image for dive profile */}
                        <View style={AppStyles.diverProfileBodyRow}>
                            <Image
                              style={AppStyles.diveProfileImage}
                              source={require('../assets/dive-profile.png')}
                            />
                        </View>
                        {/* Column (centred) */}
                        <View style={[AppStyles.diverProfileBodyRow, AppStyles.centerAlignedRow]}>
                            {/* Max depth data */}
                            <Text style={AppStyles.diverProfileBodyText}>Depth: </Text>
                            <TextInput 
                              style={AppStyles.diverProfileBodyInput} 
                              onChangeText={setMaxDepth}
                              value={maxDepth}
                              placeholder="0"
                            />
                            <Text style={AppStyles.diverProfileBodyMeasure}>m</Text>
                        </View>
                    </View>
                </View>
            </View>
            <TableView hideSeparator>
                <Section hideSeparator
                  hideSurroundingSeparators
                >
                    {/* Dive start time */}
                    <Cell
                        cellAccessoryView={<DateTimePicker 
                          testID="datePicker"
                          style={AppStyles.datePicker}
                          maximumDate={new Date()} 
                          mode="datetime"
                          value={diveStart}
                          onChange={onChangeStart}
                        />}
                        title="Time In"
                        titleTextColor={'#413FEB'}
                        titleTextStyle={AppStyles.cellTitleText}
                        hideSeparator={true}
                        cellStyle="RightDetail"
                    >
                    </Cell>
                    {/* Dive end time */}
                    <Cell
                        cellAccessoryView={<DateTimePicker 
                          testID="datePicker"
                          style={AppStyles.datePicker}
                          maximumDate={new Date()} 
                          mode="datetime"
                          minimumDate={diveStart}
                          value={diveEnd}
                          onChange={onChangeEnd}
                        />}
                        title="Time Out"
                        titleTextColor={'#413FEB'}
                        titleTextStyle={AppStyles.cellTitleText}
                        hideSeparator={true}
                        // cellStyle="RightDetail"
                    >
                    </Cell>
                    {/* Dive buddy search */}
                    <Cell
                      cellStyle="RightDetail"
                      accessory="DisclosureIndicator"
                      title="Dive Buddies"
                      contentContainerStyle={{flexDirection: 'row', justifyContent: 'space-between'}}
                      cellContentView={
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                              <Text style={[AppStyles.cellTitleText, {color: '#413FEB'}]}>Dive Buddies </Text>
                              <View style={{ flexDirection: 'row', marginLeft: 20}}>
                                { buddies.length > 0 &&
                                  buddies.map((buddy, index) => <Image key={buddy.id} source={{ uri: buddy.image_url }} style={{ width: 30, height: 30, borderRadius: 30, marginLeft: -12, borderWidth: 1, borderColor: 'white'}} /> )
                                }
                              </View>
                          </View>
                      }
                      // detail={buddies}
                      titleTextColor={'#413FEB'}
                      titleTextStyle={AppStyles.cellTitleText}
                      hideSeparator={true}
                      onPress={() => setDiveBuddyModalVisible(true)}
                    ></Cell>
                    
                    {/* Dive master search */}
                    <Cell
                      cellStyle="RightDetail"
                      accessory="DisclosureIndicator"
                      title="Dive Master"
                      detail={diveMaster}
                      titleTextColor={'#413FEB'}
                      titleTextStyle={AppStyles.cellTitleText}
                      hideSeparator={true}
                      onPress={() => setDiveMasterSearchModalVisible(true)}
                    ></Cell>
                    {/* Dive type */}
                    <Cell
                      cellStyle="Basic"
                      contentContainerStyle={AppStyles.cellContainer}
                      cellContentView={
                          <View style={{ backgroundColor: '#F5F5F5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 15, width: '100%'}}>
                                <TouchableOpacity 
                                  style={[AppStyles.toggle, trainingDive ? AppStyles.toggleUnselected : AppStyles.toggleSelected]}
                                  onPress={() => setTrainingDive(false)}
                                >
                                  <Text style={trainingDive ? AppStyles.toggleTextUnselected : AppStyles.toggleTextSelected}>Fun Dive</Text>
                              </TouchableOpacity>
                              <TouchableOpacity 
                                  style={[AppStyles.toggle, trainingDive ? AppStyles.toggleSelected : AppStyles.toggleUnselected]}
                                  onPress={() => setTrainingDive(true)}
                              >
                                  <Text style={trainingDive ? AppStyles.toggleTextSelected : AppStyles.toggleTextUnselected}>Training Dive</Text>
                              </TouchableOpacity>
                          </View>
                      }
                      hideSeparator={true}
                    ></Cell>
                    {/* Add Images */}
                    <Cell
                      cellStyle="Basic"
                      title="Add Images"
                      titleTextColor={'#413FEB'}
                      titleTextStyle={AppStyles.cellTitleText}
                      contentContainerStyle={AppStyles.cellContainer}
                      cellContentView={
                          <MultiImageUploader
                            selectedImages = {images}
                            onSelect={(images) => setImages(images)}
                          />
                      }
                      hideSeparator={true}
                    ></Cell>
                </Section>
            </TableView>  
            <View style={AppStyles.diverProfile}>
              <TableView>
                <Section
                  hideSeparator={true}
                  hideSurroundingSeparators={true}
                  headerComponent={<Text style={[AppStyles.diverProfileText, {alignSelf: 'center'}]}>Conditions</Text>}
                >
                  <Cell
                    cellStyle="Basic"
                    contentContainerStyle={AppStyles.cellContainer}
                    cellContentView={
                      <View style={{width: '100%'}}>
                        <Text style={[AppStyles.cellTitleText, AppStyles.cellTitleTextWithMargin]}>Bottom Temperature</Text>
                        <Text>{temperature}°C</Text>
                        <Slider style={{width: '100%'}} 
                                maximumValue={40} 
                                minimumValue={-20} 
                                step={1} 
                                value={temperature} 
                                onSlidingComplete={(value)=>setTemperature(value)} 
                                minimumTrackTintColor="#413FEB"
                                maximumTrackTintColor="#413FEB"
                                thumbTintColor='#FBDA76'
                        />
                      </View>
                    }
                  ></Cell>
                  <Cell
                    cellStyle="Basic"
                    contentContainerStyle={AppStyles.cellContainer}
                    cellContentView={
                      <View style={{width: '100%'}}>
                        <Text style={[AppStyles.cellTitleText, AppStyles.cellTitleTextWithMargin]}>Skies</Text>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <TouchableOpacity style={AppStyles.skySelector} onPress={() => setSky('Clear')}>
                          <Image source={sky === 'Clear' ? require('../assets/sun-select.png') : require('../assets/sun.png')} style={{width: 50, height: 50, resizeMode: 'contain'}} />
                        </TouchableOpacity>
                        <TouchableOpacity style={AppStyles.skySelector} onPress={() => setSky('PartialClouds')}>
                          <Image source={sky === 'PartialClouds' ? require('../assets/partialClouds-select.png') : require('../assets/partialClouds.png')} style={{width: 50, height: 50, resizeMode: 'contain'}} />
                        </TouchableOpacity>
                        <TouchableOpacity style={AppStyles.skySelector} onPress={() => setSky('Clouds')}>
                          <Image source={sky === 'Clouds' ? require('../assets/Clouds-select.png') : require('../assets/Clouds.png')} style={{width: 50, height: 50, resizeMode: 'contain'}} />
                        </TouchableOpacity>
                        <TouchableOpacity style={AppStyles.skySelector} onPress={() => setSky('Rain')}>
                          <Image source={sky === 'Rain' ? require('../assets/Rain-select.png') : require('../assets/Rain.png')} style={{width: 50, height: 50, resizeMode: 'contain'}} />
                        </TouchableOpacity>
                        </View>
                      </View>
                    }
                  ></Cell>
                  <Cell
                      cellStyle="Basic"
                      contentContainerStyle={AppStyles.cellContainer}
                      cellContentView={
                        <View style={{width: '100%'}}>
                        <Text style={[AppStyles.cellTitleText, AppStyles.cellTitleTextWithMargin]}>Entry</Text>
                                <View style={{ backgroundColor: '#F5F5F5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 15, width: '100%'}}>
                                
                                <TouchableOpacity 
                                  style={[AppStyles.toggleShort, entry === 'Shore' ? AppStyles.toggleSelected : AppStyles.toggleUnselected]}
                                  onPress={() => setEntry('Shore')}
                                >
                                  <Text style={entry === 'Shore' ? AppStyles.toggleTextSelected : AppStyles.toggleTextUnselected}>Shore</Text>
                              </TouchableOpacity>
                              <TouchableOpacity 
                                  style={[AppStyles.toggleShort, entry === 'Boat' ? AppStyles.toggleSelected : AppStyles.toggleUnselected]}
                                  onPress={() => setEntry('Boat')}
                              >
                                  <Text style={entry === 'Boat' ? AppStyles.toggleTextSelected : AppStyles.toggleTextUnselected}>Boat</Text>
                              </TouchableOpacity>
                              <TouchableOpacity 
                                  style={[AppStyles.toggleShort, entry === 'Controlled' ? AppStyles.toggleSelected : AppStyles.toggleUnselected]}
                                  onPress={() => setEntry('Controlled')}
                              >
                                  <Text style={entry === 'Controlled' ? AppStyles.toggleTextSelected : AppStyles.toggleTextUnselected}>Controlled</Text>
                              </TouchableOpacity>
                          </View></View>
                      }
                      hideSeparator={true}
                    ></Cell>
                  <Cell
                      cellStyle="Basic"
                      contentContainerStyle={AppStyles.cellContainer}
                      cellContentView={
                        <View style={{width: '100%'}}>
                        <Text style={[AppStyles.cellTitleText, AppStyles.cellTitleTextWithMargin]}>Water</Text>
                                <View style={{ backgroundColor: '#F5F5F5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 15, width: '100%'}}>
                                
                                <TouchableOpacity 
                                  style={[AppStyles.toggle, saltwater ? AppStyles.toggleUnselected : AppStyles.toggleSelected]}
                                  onPress={() => setSaltwater(false)}
                                >
                                  <Text style={saltwater ? AppStyles.toggleTextUnselected : AppStyles.toggleTextSelected}>Fresh</Text>
                              </TouchableOpacity>
                              <TouchableOpacity 
                                  style={[AppStyles.toggle, saltwater ? AppStyles.toggleSelected : AppStyles.toggleUnselected]}
                                  onPress={() => setSaltwater(true)}
                              >
                                  <Text style={saltwater ? AppStyles.toggleTextSelected : AppStyles.toggleTextUnselected}>Salt</Text>
                              </TouchableOpacity>
                          </View></View>
                      }
                      hideSeparator={true}
                    ></Cell>
                  <Cell
                    cellStyle="Basic"
                    contentContainerStyle={AppStyles.cellContainer}
                    cellContentView={
                      <View style={{width: '100%'}}>
                        <Text style={[AppStyles.cellTitleText, AppStyles.cellTitleTextWithMargin]}>Waves</Text>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <TouchableOpacity style={AppStyles.skySelector} onPress={() => setWaves('Surge')}>
                          <Image source={waves === 'Surge' ? require('../assets/surge-select.png') : require('../assets/surge.png')} style={{width: 50, height: 50, resizeMode: 'contain'}} />
                          <Text style={{alignSelf: 'center', marginTop: 5}}>Surge</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={AppStyles.skySelector} onPress={() => setWaves('Waves')}>
                          <Image source={waves === 'Waves' ? require('../assets/wave-select.png') : require('../assets/waves.png')} style={{width: 50, height: 50, resizeMode: 'contain'}} />
                          <Text style={{alignSelf: 'center', marginTop: 5}}>Waves</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={AppStyles.skySelector} onPress={() => setWaves('Surf')}>
                          <Image source={waves === 'Surf' ? require('../assets/surf-select.png') : require('../assets/surf.png')} style={{width: 50, height: 50, resizeMode: 'contain'}} />
                          <Text style={{alignSelf: 'center', marginTop: 5}}>Surf</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={AppStyles.skySelector} onPress={() => setWaves('Chill')}>
                          <Image source={waves === 'Chill' ? require('../assets/chill-select.png') : require('../assets/chill.png')} style={{width: 50, height: 50, resizeMode: 'contain'}} />
                          <Text style={{alignSelf: 'center', marginTop: 5}}>Chill</Text>
                        </TouchableOpacity>
                        </View>
                      </View>
                    }
                  ></Cell>
                  <Cell
                    hideSeparator={true}
                    cellStyle="Basic"
                    title="Save"
                    titleTextColor={'#413FEB'}
                    titleTextStyle={AppStyles.cellTitleText}
                    contentContainerStyle={AppStyles.cellContainer}
                    cellContentView={
                      <Text>Some content coming here</Text>
                    }
                  ></Cell>
                  <Cell
                    cellStyle="Basic"
                    contentContainerStyle={AppStyles.cellContainer}
                    cellContentView={
                      <View style={{width: '100%'}}>
                        <Text style={[AppStyles.cellTitleText, AppStyles.cellTitleTextWithMargin]}>Visibility</Text>
                        <Text>{visibility}m</Text>
                        <Slider style={{width: '100%'}} 
                                maximumValue={50} minimumValue={0} step={1} value={visibility} 
                                onSlidingComplete={(value)=>setVisibility(value)} 
                                minimumTrackTintColor="#413FEB"
                                maximumTrackTintColor="#413FEB"
                                thumbTintColor='#FBDA76'
                        />
                      </View>
                    }
                  ></Cell>
                </Section>
              </TableView>
            </View>
            <View style={AppStyles.diverProfile}>
              <TableView>
                <Section
                  hideSeparator={true}
                  hideSurroundingSeparators={true}
                  headerComponent={<Text style={[AppStyles.diverProfileText, {alignSelf: 'center'}]}>Notes</Text>}
                >
                  <Cell
                    cellStyle="Basic"
                    contentContainerStyle={AppStyles.cellContainer}
                    cellContentView={
                      <View style={{width: '100%'}}>
                        <TextInput
                          style={{height: 100, borderColor: 'gray', borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, paddingVertical: 15}}
                          onChangeText={text => setNotes(text)}
                          value={notes}
                          multiline={true}
                          numberOfLines={4}
                        />
                      </View>
                    }
                  ></Cell>
                </Section>
              </TableView>
            </View>
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
                      selectedBuddies={buddies}
                    />
                </Modal>
            </View>

            {/* Add Dive Button --> Submits dive to database */}
            <TouchableOpacity 
                style={AppStyles.buttonBlue} 
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
    // width: '95%',
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
    // textInput: {
    //   height: 30,
    //   marginVertical: 12,
    //   padding: 10,
    //   paddingHorizontal: 15,
    //   borderRadius: 15,
    //   backgroundColor: '#413FEB',
    //   color: 'white',
    //   width: '45%',
    //   textAlign: 'center',
    //   marginHorizontal: '3%',
    // },

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