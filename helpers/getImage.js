import { db, auth, storage } from '../firebase';


let getFirebaseImage = (image_name, uid) => {
    // Create a reference to the file we want to download
    var storageRef = storage.ref();
    var profilePicRef = storageRef.child(uid + '/' + image_name);
    // Get the download URL
    profilePicRef.getDownloadURL()
    // return url
    .then((url) => {
      // Insert url into an <img> tag to "download"
      console.log(url)
      return url;
    })
    .catch((error) => {
      // A full list of error codes is available at
      // https://firebase.google.com/docs/storage/web/handle-errors
      switch (error.code) {
        case 'storage/object-not-found':
          // File doesn't exist
          break;
        case 'storage/unauthorized':
          // User doesn't have permission to access the object
          break;
        case 'storage/canceled':
          // User canceled the upload
          break;
  
        // ...
  
        case 'storage/unknown':
          // Unknown error occurred, inspect the server response
          break;
      }
    });
  };


  export default getFirebaseImage;