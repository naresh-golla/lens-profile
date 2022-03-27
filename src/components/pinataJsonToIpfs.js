// require('dotenv').config();
// const key = process.env.REACT_APP_PINATA_KEY;
// const secret = process.env.REACT_APP_PINATA_SECRET;
import { v4 as uuidv4 } from 'uuid';
import {pinataApiKey, pinataSecretApiKey} from "./exp"
const axios = require('axios');

export const pinJSONToIPFS = async(JSONBody) => {

    //Add metadata woth post data
    let postObjWithMeta = {
        pinataMetadata: {
            name: 'ItemStatus',
            keyvalues: {
                ItemID: 'Item001',
                CheckpointID: 'Checkpoint002',
                Source: 'CompanyA',
                WeightInKilos: 5.25
            }
        },
        pinataContent: {
            version: '1.0.0',
            metadata_id: uuidv4(),
            description: 'Description',
            content: JSONBody,
            external_url: null,
            image: null,
            imageMimeType: null,
            name: 'post',
            attributes: [],
            media: [],        
        }
    
    }
    console.log("postObjWithMeta",postObjWithMeta)
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    //making axios POST request to Pinata ⬇️
    return axios 
        .post(url, postObjWithMeta, {
            headers: {
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey,
            }
        })
        .then(function (response) {
            console.log("response",response)
           return {
               success: true,
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