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

   const onChange = async(e)=>{
      const file = await e.target.files[0];
      updateFileUrl(file)
    }
   

    const onFinish = async (values) => {

      let {handle} = values.user

      if(handle.length === 0){        
        openErrorNotification("validation","Please input your handle!")
        return
      }
        console.log("values",values);
        const getIpfsUrl = await pinFileToIPFS0(fileUrl);
        if (!getIpfsUrl.success) {
          console.log("Something went wrong while uploading your image")
        } 
        let {response} = getIpfsUrl;
        console.log("response", response, "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash)
        let profilePicUrl = "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash;

        const profileObj={
          handle,
          profilePictureUri: profilePicUrl,
          followNFTURI: null,
          followModule: null
        }

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

    return (
        <div className="nft-wrapper">
          <h5 class="color-white u-ml-40">Create Profile</h5>
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