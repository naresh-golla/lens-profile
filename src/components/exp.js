//imports needed for this function
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
export const pinataApiKey = "53d14302cb4bb73446a1"
export const pinataSecretApiKey = "cf7e6b5d9f9a826fe8ba03652b63ffb03aab2255b1f07dadb0b90e5e3066741c"

export const pinFileToIPFS0 = (file) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    //we gather a local file for this example, but any valid readStream source will work here.
    let data = new FormData();
    data.append('file', file);
    // data.append('file', fs.createReadStream('./yourfile.png'));

    //You'll need to make sure that the metadata is in the form of a JSON object that's been convered to a string
    //metadata is optional
    const metadata = JSON.stringify({
        name: 'testname',
        keyvalues: {
            exampleKey: 'exampleValue'
        }
    });
    data.append('pinataMetadata', metadata);

    //pinataOptions are optional
    const pinataOptions = JSON.stringify({
        cidVersion: 0,
        customPinPolicy: {
            regions: [
                {
                    id: 'FRA1',
                    desiredReplicationCount: 1
                },
                {
                    id: 'NYC1',
                    desiredReplicationCount: 2
                }
            ]
        }
    });
    data.append('pinataOptions', pinataOptions);

    return axios
        .post(url, data, {
            maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey
            }
        })
        .then(function (response) {
            return {
                success:true,
                response
            }
            // console.log("response", "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash)
           
        })
        .catch(function (error) {
            console.log("error",error)
            return {
                success:true,
            }
        });
};