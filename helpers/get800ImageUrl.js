/**
 * Provided an imageUrl, this function returns a 200x200 image url
 * @param {string} imageUrl 
 * @returns 800x800 image url
 */

 const get800ImageUrl = ( imageUrl ) =>{
    // let photo_url = imageUrl.split('.')[0];
    // console.log('imageUrl', imageUrl);
    let file_extension = imageUrl.split('.').pop();
    let with_800 = `_800x800.${file_extension}`;
    return `${imageUrl.replace('.'+file_extension, with_800)}`;

}

export default get800ImageUrl;