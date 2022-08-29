/**
 * Provided an imageUrl, this function returns a 200x200 image url
 * @param {string} imageUrl 
 * @returns 200x200 image url
 */

const get200ImageUrl = ( imageUrl ) =>{
    // let photo_url = imageUrl.split('.')[0];
    // console.log('imageUrl', imageUrl);
    let file_extension = imageUrl.split('.').pop();
    let with_200 = `_200x200.${file_extension}`;
    return `${imageUrl.replace('.'+file_extension, with_200)}`;

}

export default get200ImageUrl;