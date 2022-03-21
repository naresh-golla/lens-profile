import axios from "axios";

// require('dotenv').config();
// const key = process.env.REACT_APP_PINATA_KEY;
// const secret = process.env.REACT_APP_PINATA_SECRET;
const key = "53d14302cb4bb73446a1"
const secret = "cf7e6b5d9f9a826fe8ba03652b63ffb03aab2255b1f07dadb0b90e5e3066741c"

export const pinFileToIPFS = async(JSONBody) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    //making axios POST request to Pinata ⬇️
    return axios 
        .post(url, JSONBody, {
            headers: {
                pinata_api_key: key,
                pinata_secret_api_key: secret,
            }
        })
        .then(function (response) {
           return {
               success: true,
               response,
               pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
           };
        })
        .catch(function (error) {
            console.log(error)
            return {
                success: false,
                message: error.message,
            }
    });
};