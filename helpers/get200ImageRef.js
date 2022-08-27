
/* 
Provided an image reference, this function returns a 200x200 image reference
@imageRef {string} - the image reference
@return {string} - the 200x200 image reference
*/
const get200ImageRef = ( imageRef ) => {
    // Strip if uri
    let photo_id = imageRef.split('/').pop();
    photo_id = photo_id.split('.')[0];
    let file_extension = imageRef.split('.').pop();
    return `${photo_id}_200x200.${file_extension}`;

}

export default get200ImageRef;