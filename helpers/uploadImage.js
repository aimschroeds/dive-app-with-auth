import { db, auth, storage } from '../firebase';
import get200ImageUrl from '../helpers/get200ImageUrl';


    // Upload image to firebase bucket  
    async function handleImageUpload (uri) {
        // Attempt to upload image and set as profile picture
        try {
            let downloadUrl = await uploadImageAsync(uri);
            console.log('downloadUrl2', downloadUrl);
            let downloadUrl200 = get200ImageUrl(downloadUrl);
            console.log('downloadUrl200', downloadUrl200);
            return downloadUrl200;
        }
        catch (error) {
            console.log(error.message);
        }
        finally {
            
        }
    }

    // Take image uri, convert to blob, and upload to bucket
    async function uploadImageAsync(uri) {
    // Convert to blob
    const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            resolve(xhr.response);
        };
        xhr.onerror = function (e) {
            console.log(e);
            reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
        });
        // Create ref at which to upload image
        const photo_id = uri.split('/').pop();
        const ref = storage.ref().child(`${auth.currentUser.uid}/${photo_id}`);
        // Upload image
        const snapshot = await ref.put(blob);
        // We're done with the blob, close and release it
        blob.close();
        // Get download url of image
        let downloadUrl = await snapshot.ref.getDownloadURL();
        console.log('downloadUrl', downloadUrl);
        return downloadUrl;
    }

export default handleImageUpload;