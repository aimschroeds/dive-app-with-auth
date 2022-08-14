import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  imageContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
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
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'space-between',
    marginTop: 30,
    },  
  section: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'space-between',
    marginTop: -30,
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
});