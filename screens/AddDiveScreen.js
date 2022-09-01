import { Image, KeyboardAvoidingView, Modal, RefreshControl, StyleSheet, SafeAreaView, 
          ScrollView, Text, TextInput, View, TouchableOpacity  } from 'react-native';

import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';

import { db, auth } from '../firebase';

import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';

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
  const [diveLocation, setDiveLocation] = useState({});
  const [diveStart, setDiveStart] = useState(new Date());
  const [diveEnd, setDiveEnd] = useState(new Date());
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
  const [diveLocationModalVisible, setDiveLocationModalVisible] = useState(false);
  const [diveBuddyModalVisible, setDiveBuddyModalVisible] = useState(false);

  // Constants for managing user status
  const [userNotVerified, setUserNotVerified] = useState(!auth.currentUser.emailVerified);

  // Constants for managing messaging to user
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const scrollRef = useRef();

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

    // https://stackoverflow.com/questions/31883211/scroll-to-top-of-scrollview
    // Scroll to top of screen if error message is set
    const goToTop = () => {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    }

    // Set dive start time
    const onChangeStart = (event, selectedTime) => {
        const currentSelectedTime = selectedTime;
        setDiveStart(currentSelectedTime);
        // End time updated to be same as start time to reduce hassle
        setDiveEnd(currentSelectedTime);
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
    
    useEffect(() => {
      if (errorMessage)
      {
        goToTop();
      }
    }, [errorMessage])

    const validateDive = (dive) => {
        if (dive.diveSite === undefined) {
            setErrorMessage('Please select a dive location')
            return false
        } else if (dive.diveProfile.diveStart === null) {
            setErrorMessage('Please select a dive start time')
            return false
        } else if (dive.diveProfile.diveEnd === null) {
            setErrorMessage('Please select a dive end time')
            return false       
        } else if (dive.diveProfile.startPressure.value === '') {
            setErrorMessage('Please enter a start pressure')
            return false
        } else if (dive.diveProfile.endPressure.value === '') {
            setErrorMessage('Please enter an end pressure')
            return false
        } else if (dive.diveProfile.maxDepth.value === '') {
            setErrorMessage('Please enter a max depth')
            return false
        } else if (dive.conditions.temperature.value === '') {
            setErrorMessage('Please enter a temperature')
            return false
        } else if (dive.conditions.visibility.value === '') {
            setErrorMessage('Please enter a visibility')
            return false
        } else if (dive.conditions.sky === '') {
            setErrorMessage('Please select the weather conditions in the sky')
            return false
        } else if (dive.conditions.waves === '') {
            setErrorMessage('Please select the state of waves at entry')
            return false
        } else if (dive.conditions.entry === '') {
            setErrorMessage('Please select an entry')
            return false
          }

      if (dive.buddies) {
        setBuddies(null)
      }
      if (dive.notes === '') {
        setNotes(null)
      } 
      if (dive.images) {
        setImages(null);  
      }
      if (dive.diveProfile.surfaceInterval === '') {
      setSurfaceInterval(null); 
      }

      setErrorMessage(null)
      return true
        
    }

  // Add dive to "dives" collection in Firebase
    let addDive = async () => {
      console.log('add dive called')
      setErrorMessage('');
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
        if (dive && validateDive(dive)) {
          console.log('dive is valid', dive)
              db.collection("dives").add(dive)
              .then((docRef) => {
                  console.log("Document written with ID: ", docRef.id);
                  setSuccessMessage('Dive added!')
                  setDiveLocation({});
                  setBuddies([]);
                  setDiveStart(new Date());
                  setDiveEnd(new Date());
                  setSurfaceInterval('');
                  setStartPressure('');
                  setEndPressure('');
                  setMaxDepth('');
                  setTrainingDive(false);
                  setImages([]);
                  setTemperature(25);
                  setVisibility(10);
                  setSky('');
                  setWaves('');
                  setSaltwater(true);
                  setEntry('');
                  setNotes('');
                  setImages([]);
                  navigation.navigate('Home')
                })
                .catch(error => {
                    setErrorMessage(error.message)
                })
            }
    };

  return (
    <SafeAreaView style={{backgroundColor: 'white'}}>  
        <ScrollView style={{height:"100%"}} 
          ref={scrollRef}
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
              { diveLocation?.name && <MapView
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
                  <TouchableOpacity style={[AppStyles.buttonBlue, AppStyles.buttonBlueLarge]} 
                        onPress={sendVerificationEmail}>
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
              {/* Capture dive data */}
              {/* Dive Location Data */}
              <View style={AppStyles.container}>
                {/* Add Dive Site: Opens modal where user can select or add new dive site location */}
                  <TouchableOpacity style={[AppStyles.buttonBlue, AppStyles.section]} 
                    onPress={() => setDiveLocationModalVisible(true)}
                  >
                      <Icon name="searching-location-gps-indicator" height='15' width='15' color="white" style={AppStyles.buttonIcon}/>
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
                      <Icon name="location-arrow" height='15' width='15' color="white" style={AppStyles.buttonIcon}/>
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
                                { buddies?.length > 0 &&
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
                    {/* Dive type */}
                    <Cell
                      cellStyle="Basic"
                      contentContainerStyle={AppStyles.cellContainer}
                      cellContentView={
                          <View style={AppStyles.cellPrimaryView}>
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
                                <View style={AppStyles.cellPrimaryView}>
                                
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
                                <View style={AppStyles.cellPrimaryView}>
                                
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
            { errorMessage && 
                  <Text style={AppStyles.errorMessage}>{errorMessage}</Text>
              }
            {/* Add Dive Button --> Submits dive to database */}
            <TouchableOpacity 
                style={[AppStyles.buttonBlue, AppStyles.buttonBlueLarge, {marginBottom: 50}]} 
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

