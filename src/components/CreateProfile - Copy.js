import React, { useContext, useEffect, useState } from 'react'
import { UserDataContext } from "../allContextProvider"
import { Image } from 'antd';
import { Spin } from 'antd';
import { LoadingOutlined ,UploadOutlined} from '@ant-design/icons';
import { Form, Input, InputNumber, Button,Upload } from 'antd';
import { create } from 'ipfs-http-client'
import { pinFileToIPFS } from './pinata';
import { openErrorNotification, openSuccessNotification } from '../utils/ResuableFunctions';
import { get, isArray, map, forEach,isEmpty } from "lodash";
import { createProfile } from './profile/create-profile';
import { pinFileToIPFS0 } from './exp';

// const client = create('https://ipfs.infura.io:5001/api/v0')

const key = "53d14302cb4bb73446a1"
const secret = "cf7e6b5d9f9a826fe8ba03652b63ffb03aab2255b1f07dadb0b90e5e3066741c"

const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 8,
    },
  };
  const validateMessages = {
    required: '${label} is required!',
    types: {
      email: '${label} is not a valid email!',
      number: '${label} is not a valid number!',
    },
    number: {
      range: '${label} must be between ${min} and ${max}',
    },
  };
const CreateProfile = () => {

  const [fileUrl, updateFileUrl] = useState(null);

  // useEffect(()=>{
  //   if(fileUrl != null ){
  //     let obj ={
  //       "file" : fileUrl
  //     }
  //     const pinataResponse =  pinFileToIPFS(obj)
  //     if (!pinataResponse.success) {
  //       console.log("Something went wrong while uploading your tokenURI")
  //     } 
  //     console.log("pinataUrl", pinataResponse.pinataUrl)
  //   }
  // },[fileUrl])

  // const onChange = async (e)=> {
  //   const file = e.target.files[0]
    
  //   try {
  //     const added = await client.add(file)
  //     const url = `https://ipfs.infura.io/ipfs/${added.path}`
  //     updateFileUrl(url)
  //   } catch (error) {
  //     console.log('Error uploading file: ', error)
  //   }  
  // }

  // async function onChange(e) {
  //   const file = e.target.files[0]
  //   let ipfs = await create({
  //     url: "https://api.pinata.cloud/psa",
  //     repo: 'file-path' + Math.random()
  //   })
  //   const { cid } = await ipfs.add(file)
  //   const url = `https://gateway.pinata.cloud/ipfs/${cid.string}`
  //   console.log(url)
  // }

   const onChange = async(e)=>{
      const file = await e.target.files[0];
      updateFileUrl(file)
      // let strFile = JSON.stringify(file)

      // console.log("file",file)

      // let obj ={
      //   "file" : file
      // }

      // const getIpfsUrl =  await pinFileToIPFS0(key,secret,file);
      // if (!getIpfsUrl.success) {
      //   console.log("Something went wrong while uploading your image")
      // } 
      // let {response} = getIpfsUrl;
      // console.log("response", response, "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash)        
      

    }
   

    const onFinish = async (values) => {

      let {handle} = values.user
      const profileObj={
        handle,
        profilePictureUri: profilePicUrl,
        followNFTURI: null,
        followModule: null
      }
      if(handle.length === 0){        
        openErrorNotification("validation","Please input your handle!")
        return
      }
        console.log("values",values);
        const getIpfsUrl = await pinFileToIPFS0(key,secret,fileUrl);
        if (!getIpfsUrl.success) {
          console.log("Something went wrong while uploading your image")
        } 
        let {response} = getIpfsUrl;
        console.log("response", response, "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash)
        let profilePicUrl = "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash;

        
        // let {handle,name,location,twitterUrl,website,bio} = values.user

        try{
          const res = await createProfile(profileObj);
          console.log("createProfile res-",res)
          let data = get(res, "data", {});
          const {txHash,reason} = data.createProfile
          if(txHash){
            openSuccessNotification("Profile Created",txHash)

          }else if(reason){
            openErrorNotification("Profile Not Created",reason)
          }
          console.log("data-",data)
        }catch(error){
          console.log("create Profile",error.message)
          openErrorNotification("Error",error.message)
        }
    };

    const normFile = (e) => {
        console.log('Upload event:', e);      
        if (Array.isArray(e)) {
          return e[0] && e[0].fileList;
        }
        return e && e.fileList;
    };


    // const handleCreateProfile =async ()=>{
    //   const profileObj={
    //     handle: "avatar",
    //     profilePictureUri: "https://avatarfiles.alphacoders.com/888/thumb-1920-88879.gif",
    //     followNFTURI: null,
    //     followModule: null
    //   }
    //   try{
    //     const res = await createProfile(profileObj);
    //     console.log("red",res)
    //     let data = get(res, "data", {});
    //     const {txHash,reason} = data.createProfile
    //     if(txHash){
    //       openSuccessNotification("Profile Created",txHash)
    //     }else if(reason){
    //       openErrorNotification("Profile Not Created",reason)
    //     }
    //     console.log("data-",data)
    //   }catch(error){
    //     console.log("create Profile",error.message)
    //     openErrorNotification("Error",error.message)
    //   }
  
    // }

    return (
        <div className="nft-wrapper">
          <Form {...layout} name="nest-messages" onFinish={onFinish} validateMessages={validateMessages}>
            <Form.Item
              name={['user', 'handle']}
              tooltip="every one will be able to search you with handle"
              label="handle"
              rules={[
                {
                  required: true,
                  message: 'Please input your handle!',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Profile Pic"
            >
              <input
                type="file"
                onChange={onChange}
              />
            </Form.Item>

          
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>

          </Form>
        </div>
    )
}

export default CreateProfile