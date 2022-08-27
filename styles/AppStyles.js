import { Dimensions, StyleSheet } from 'react-native';


export default StyleSheet.create({
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
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
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
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  }, 
  searchBar: {
    // flex: 1,
    // alignItems: 'center',
    width: '95%',
  },
  listView: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  unread: {
    backgroundColor: '#E0E0E0',
  },
  read: {
    backgroundColor: '#fff',
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
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'space-between',
    marginTop: 30,
    // borderWidth: 1,
    },  
    topMargin: {
        marginTop: 150,
        position: 'absolute',
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
  mapViewContainer: {
    paddingHorizontal: 20,
    marginTop: 0,
    // paddingVertical: -20,
  },
  containerColumnDir: {
      flex: 1,
      flexDirection: 'row',
    //   justifyContent: 'center',
    //   alignContent: 'space-between',
    //   marginTop: 30,
        marginHorizontal: '5%',
      },  
  leftAlign: {
    alignSelf: 'flex-start',
  },
  marginVert: {
    // marginVertical: 5,
    paddingVertical: 15,
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  profilePic: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 50,
    marginLeft: '5%',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    // marginBottom: 10,
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
errorMessage: {
    color: 'red',
},
successMessage: {
    color: 'green',
},
locationButtonText: {
    color: 'white', 
    marginLeft: 10,
},
headerButton: {
    // borderWidth: 2,
    // borderColor: "#00b5ec",
    // borderRadius: 30,
    padding: 6,
    marginRight: 10,
  },
plusButtonText: {
    color: '#00b5ec',
    paddingHorizontal: 10,
},
paragraph: {
    fontSize: 15,
    marginTop: 8,
  },
  checkbox: {
    margin: 8,
  },

  buttonBlue: {
    height: 39,
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
  buttonBlueSmall: {
    width: '30%',
  },
});