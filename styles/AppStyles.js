import { Dimensions, StyleSheet } from 'react-native';


export default StyleSheet.create({
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  buttonHome: {
    backgroundColor: '#00b5ec',
    width: '60%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 40,
  },

  buttonBlue: {
    height: 30,
    marginVertical: 6,
    padding: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: '#413FEB',
    color: 'white',
    width: '45%',
    textAlign: 'center',
    marginHorizontal: '3%',
  },
  buttonBlueSmall: {
    width: '30%',
  },
  buttonBlueLarge: {
    width: '95%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
  },
  buttonIcon: {
    marginTop: 2,
  },
  cellContainer: {
    flexDirection: 'row', justifyContent: 'space-between', padding: 10, marginVertical: 3,
  },
  cellTitleText: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    color: '#413FEB',
    // marginBottom: 5,
  },
  cellTitleTextWithMargin: {
    marginTop: 10,
    marginBottom: 20,
  },
  centerAlignedRow: {
    justifyContent: 'center',
    marginTop: -20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  checkbox: {
    margin: 8,
  },
  containerOrig: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'space-between',
    marginTop: 10,
    // borderWidth: 1,
    },  
  containerColumnDir: {
    flex: 1,
    flexDirection: 'row',
  //   justifyContent: 'center',
  //   alignContent: 'space-between',
  //   marginTop: 30,
      marginHorizontal: '5%',
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
  diveProfileImage: {
    alignSelf: 'stretch',
    marginTop: -10,
  },
  diverProfileText: {
    fontSize: 16,
    color: '#413FEB',
    marginHorizontal: 10,
    fontFamily: 'Helvetica',
  },
  
  diverProfileBody: {
    backgroundColor: '#EBF6FA',
    marginTop: -15,
    paddingTop: 15,
    flex: 1, 
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
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
  
  errorMessage: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    color: 'red',
  },
  headerButton: {
    // borderWidth: 2,
    // borderColor: "#00b5ec",
    // borderRadius: 30,
    padding: 6,
    marginRight: 10,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    height: 50,
    margin: 12,
    padding: 10,
    borderRadius: 12,
    // backgroundColor: '#413FEB',
    borderWidth: 1,
    borderColor: '#413FEB',
  },
  listView: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  leftAlign: {
    alignSelf: 'flex-start',
  },
  leftAlignedRow: {
    justifyContent: 'flex-start',
  },
  locationButtonText: {
    color: 'white', 
    marginLeft: 10,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginInputContainer: {
      width: '80%',
  },
  loginInput: {
      backgroundColor: 'white',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 10,
      marginTop: 5,
  },
  loginButtonContainer: {
      width: '60%',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 40,
  },
  loginButton: {
      backgroundColor: '#00b5ec',
      width: '100%',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
  },
  loginButtonText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 18,
  },
  loginButtonOutline: {
      backgroundColor: 'white',
      marginTop: 5,
      borderColor: '#00b5ec',
      borderWidth: 2,
  },
  loginButtonOutlineText: {
      color: '#00b5ec',
      fontWeight: '700',
      fontSize: 18,
  },
  marginVert: {
    // marginVertical: 5,
    paddingVertical: 15,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 200,
  },
  mapSetMarker: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 250,
  },
//   mapMedium: {
//     width: Dimensions.get('window').width,
//     height: Dimensions.get('window').height - 400,
//   },
  smallMap: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height / 4,
    marginLeft: - 20,
  },
  mapViewContainer: {
    paddingHorizontal: 20,
    marginTop: 0,
    // paddingVertical: -20,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  }, 
  profilePic: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 50,
    marginLeft: '5%',
  },
  
  plusButtonText: {
      color: '#00b5ec',
      paddingHorizontal: 10,
  },
  paragraph: {
      fontSize: 15,
      marginTop: 8,
    },
  read: {
    backgroundColor: '#fff',
  },
  searchBar: {
    // flex: 1,
    // alignItems: 'center',
    width: '95%',
  },
  section: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    // alignContent: 'space-between',
    // marginTop: -30,
  },
  scrollContainer: {
    flex: 1,
  },
  smallIcon: {
    width: 20,
    height: 20,
    paddingTop: 5,
  },
  successMessage: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    color: 'green',
},
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    // marginBottom: 10,
  },
  toggle: {
    paddingVertical: 5, 
    borderRadius: 15, 
    paddingHorizontal: 30, 
    // marginRight: 15,
    width: '50%',
    alignItems: 'center',
    
  },
  toggleShort: {
    paddingVertical: 5, 
    borderRadius: 15, 
    // paddingHorizontal: 10, 
    // marginRight: 15,
    width: '33.3%',
    alignItems: 'center',
  },
  toggleSelected: {
    backgroundColor: '#413FEB',
  },
  toggleTextSelected: {
    color: 'white',
  },
  toggleTextUnselected: {
    color: 'black',
  },
  toggleUnselected: {
    backgroundColor: '#F5F5F5',

  },
  topMargin: {
    marginTop: 150,
    position: 'absolute',
},
  unread: {
    backgroundColor: '#E0E0E0',
  },
  userDataInput: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      padding: 10,
      width: '60%',
      marginHorizontal: '5%',
      marginVertical: 25,
      height: 50,
      alignSelf: 'flex-start',
  }, 
  wave: {
    marginTop: 20,
    width: '100%',
  },  
});