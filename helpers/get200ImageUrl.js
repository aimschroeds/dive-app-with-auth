const get200ImageUrl = ( imageUrl ) =>{
    // let photo_url = imageUrl.split('.')[0];
    let file_extension = imageUrl.split('.').pop();
    let with_200 = `_200x200.${file_extension}`;
    return `${imageUrl.replace('.'+file_extension, with_200)}`;

}

export default get200ImageUrl;