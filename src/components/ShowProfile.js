import React, { useContext, useEffect, useState } from 'react'
import { get, isNil, trimEnd ,isObject } from "lodash"
import { getProfiles } from './get-profiles';
import { openErrorNotification, openSuccessNotification } from '../utils/ResuableFunctions';
import "../css/ShowProfile.css"
import { Button, Tabs, Modal, Form, Input ,Spin} from 'antd';
import { Link, Navigate, NavLink } from 'react-router-dom';
import { pinFileToIPFS0 } from './exp';
import { updateProfile } from './update-profile';
import { LoadingOutlined, EditOutlined,PlusCircleOutlined } from '@ant-design/icons';
import defImage from "../assets/lp.jpg"
import coverImage from "../assets/cover.PNG"
import { pinJSONToIPFS } from './pinataJsonToIpfs';
import { createPostTypedData } from './create-post-typed-data';
import { signedTypeData, splitSignature } from './ethers-service';
import { lensHub } from './lens-hub';
import { UserDataContext } from '../allContextProvider';


const { TabPane } = Tabs;

const defaultImg = "https://gateway.pinata.cloud/ipfs/QmY9dUwYu67puaWBMxRKW98LPbXCznPwHUbhX5NeWnCJbX";
const defaultBGimg = "https://images.pexels.com/photos/1731427/pexels-photo-1731427.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260";

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 12,
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

const ShowProfile = () => {
  const [idData, setIdData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCPLoading, setCPIsLoading] = useState(false)

  const [visible, setVisible] = React.useState(false);
  const [cpvisible, setcpVisible] = React.useState(false);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [modalText, setModalText] = React.useState('Content of the modal');
  const [fileUrl, updateFileUrl] = useState(null);
  const [spinner, setSpinner] = useState(false);
  const [successCallRender, setSuccessCallRender] = useState(false)

  let idUrl = window.location.pathname.slice(10)
  console.log("query idUrl", idUrl)

  const user_Data_Context = useContext(UserDataContext)
  console.log("user_Data_Context--NFT-->", user_Data_Context)
  let {userAddress} = user_Data_Context.userData
  let currentAccount = sessionStorage.getItem("currentAccount")

  const onChange = async (e) => {
    const file = await e.target.files[0];
    updateFileUrl(file)
  }

  useEffect(() => {
    handleRenderProfiles();
  }, [])

  useEffect(() => {
    handleRenderProfiles();
  }, [idData])

  
  function callback(key) {
    console.log(key);
  }

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    setModalText('The modal will be closed after two seconds');
    setConfirmLoading(true);
    setTimeout(() => {
      setVisible(false);
      setConfirmLoading(false);
    }, 2000);
  };

  const handleCancel = () => {
    console.log('Clicked cancel button');
    setVisible(false);
    setIsLoading(false);
    setCPIsLoading(false)
    setcpVisible(false)
  };


  const handleRenderProfiles = async () => {
    let obj = { profileIds: [idUrl], limit: 10 }
    try {
      const res = await getProfiles(obj)
      let data = await get(res, ["data", "profiles", "items"], null);
      setIdData(data)
      console.log("idData", data)
    } catch (error) {
      openErrorNotification("Error while loading Profile's", error.message)
      console.log("idData", error.message)
    }
  }

  const handleEditProfile = () => {
    setIsLoading(!isLoading);
    setVisible(!visible)
  }

  const getImageUrl = async () =>{
    //getting IPFS url
    try {
      const getIpfsUrl = await pinFileToIPFS0(fileUrl);
      if (!getIpfsUrl.success) {
        console.log("Something went wrong while uploading your image")
      } 
      let {response} = await getIpfsUrl;
      // console.log("response", response, "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash)
      let profilePicUrl = "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash;
      return profilePicUrl      
    } catch (error) {
      setSpinner(false)
      setIsLoading(false);
    }
  }

  const onFinish = async (values) => {
    setSpinner(true)
    console.log("input values ", values.user)
    let valuesObj = values.user;

    let profilePicUrl = null;
    if(!isNil(fileUrl)){
      profilePicUrl = await getImageUrl(fileUrl);      
    }
    let coverPicture = {coverPicture : profilePicUrl} 
    let profileId = {"profileId" : idUrl};
    console.log("coverPicture",coverPicture)

    let finalObj = {...valuesObj,...profileId,...coverPicture}

    let prevObj = idData[0];
    // prevObj.location = "hyderabad";
    // console.log("prevObj",prevObj)
    // console.log("finalObj",finalObj)

    // assigning previous values to new feilds
    for (const prop of Object.keys(finalObj)) {
      if (prop in prevObj) {
        console.log("prop-->",finalObj[prop])
        console.log("prop-->",prop)
        if( finalObj[prop] === "" || finalObj[prop] === undefined || finalObj[prop] === null){
          if(isObject(prevObj[prop])){
            console.log("propin ====",prevObj[prop],"jjjj",prevObj[prop].original.url)
            finalObj[prop] = prevObj[prop].original.url
          }else{
            finalObj[prop] = prevObj[prop];            
          }

        }
      }
    }
    console.log("prevObj--->",prevObj)
    console.log("finalObj--->",finalObj)
    //converting empty value to null
    // Object.keys(finalObj).forEach(item => {
    //   console.log(finalObj[item])
    //     if( finalObj[item] === "" || finalObj[item] === undefined){
    //       finalObj[item] = null 
    //     }
    // })
    console.log("finalObj",finalObj)
    try {
      let response = await updateProfile(finalObj);
      let data = get(response, ["data","updateProfile"], {});
      if(data.id === idUrl){
        handleRenderProfiles()
        console.log("update profile data",data)
        openSuccessNotification("Profile Updated","succesfully updated profile")
        setVisible(false)
        setSpinner(false)
        setIsLoading(false);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
        // setSuccessCallRender(!successCallRender)
      }

    } catch (error) {
      console.log("error while updating profile",error)
      openErrorNotification("error","something went wrong")
      setVisible(false)
      setSpinner(false)
      setIsLoading(false);
    }

  }

  const onPostFinish = async (values)=>{
    // setSpinner(true)
    let {post} = values.user
    console.log("idData-->>",idData)
    console.log("handle", values.user)
    let obj = new Object();
    obj.post = post
    const resIpfsPost = await pinJSONToIPFS(obj)
    console.log("resIpfsPost",resIpfsPost)
    if(resIpfsPost.success){
      let resIpfsPostUrl = await resIpfsPost.pinataUrl
      console.log("resIpfsPost",resIpfsPostUrl)

      let createPostReqObj = {
        profileId: idUrl,
        contentURI: resIpfsPostUrl,
        collectModule: {
          timedFeeCollectModule: {
              amount: {
                 currency: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
                 value: "0.01"
               },
               recipient: userAddress || currentAccount,
               referralFee: 10.5
           }
        },
        referenceModule: {
            followerOnlyReferenceModule: false
        }
      } 
      console.log("createPostReqObj",createPostReqObj)
      const result = await createPostTypedData(createPostReqObj);
      const typedData = result.data.createPostTypedData.typedData;
      
      const signature = await signedTypeData(typedData.domain, typedData.types, typedData.value);
      const { v, r, s } = splitSignature(signature);
      
      const tx = await lensHub.postWithSig({
        profileId: typedData.value.profileId,
        contentURI:typedData.value.contentURI,
        collectModule: typedData.value.collectModule,
        collectModuleData: typedData.value.collectModuleData,
        referenceModule: typedData.value.referenceModule,
        referenceModuleData: typedData.value.referenceModuleData,
        sig: {
          v,
          r,
          s,
          deadline: typedData.value.deadline,
        },
      });
      console.log("tx.hash",tx.hash);
      // 0x64464dc0de5aac614a82dfd946fc0e17105ff6ed177b7d677ddb88ec772c52d3
      // you can look at how to know when its been indexed here: 
      //   - https://docs.lens.dev/docs/has-transaction-been-indexed
    
    
    }else{
      openSuccessNotification("Error","Something went Wrong")
    }
  }

  const handleCreatePost = ()=>{
    setCPIsLoading(!isCPLoading);
    setcpVisible(!cpvisible)
  }

  const antIcon = <LoadingOutlined style={{ fontSize: 50, textAlign: "center" }} spin />

  return (
    <div class="showProfileDiv">
      {spinner && <div class="spinnerWrapper"><Spin indicator={antIcon} /></div>}
      <div className="container">
        {
          (!isNil(idData) && idData.length > 0) ? (
            <>             
              <header class="showProfileHeader"
                style={{
                  backgroundImage: (!isNil(idData[0].coverPicture)) ? `url(${idData[0].coverPicture.original.url})` : `url(${coverImage})`
                  // backgroundImage : `url(${defaultBGimg})`
                  // `url(${idData[0].coverPicture.original.url})`
                }}
              ></header>
              <main>
                <div className="row">
                  <div className="left col-lg-4">
                    <div className="photo-left">
                      <img alt="default cover" className="photo"
                        src={(!isNil(idData[0].picture)) ? idData[0].picture.original.url : defImage}
                      />
                    </div>
                    <h4 className="name">{idData[0].name}</h4>
                    <p className="info">{idData[0].handle}</p>
                    <p className="location">
                      {!isNil(idData[0].location) && <i class="fa fa-map-marker" aria-hidden="true"></i>}
                      <span>{idData[0].location}</span>
                    </p>
                    <div className="stats row">
                      <div className="stat col-xs-4" style={{ paddingRight: "50px" }}>
                        <p className="number-stat">{idData[0].stats.totalFollowers}</p>
                        <p className="desc-stat">Followers</p>
                      </div>
                      <div className="stat col-xs-4">
                        <p className="number-stat">{idData[0].stats.totalFollowing}</p>
                        <p className="desc-stat">Following</p>
                      </div>
                      <div className="stat col-xs-4" style={{ paddingLeft: "50px" }}>
                        <p className="number-stat">{idData[0].stats.totalPosts}</p>
                        <p className="desc-stat">Posts</p>
                      </div>
                    </div>
                    <p className="desc">{idData[0].bio}</p>
                    <div className="social">
                      {idData[0].twitterUrl &&
                        <a href={idData[0].twitterUrl} target="_blank" rel="noreferrer">
                          <i className="fa fa-twitter" aria-hidden="true"></i>
                        </a>
                      }

                      {idData[0].website &&
                        <a href={idData[0].website} target="_blank" rel="noreferrer">
                          <i className="fa fa-link" aria-hidden="true"></i>
                        </a>
                      }

                    </div>
                  </div>
                  <div className="right col-lg-8">
                    <div class="buttonList">
                      <div className="">
                        <Button className='cta-button' type="primary" shape="round" size="large" loading={isLoading} onClick={handleEditProfile}>Edit Profile <EditOutlined /></Button>
                      </div>
                      <div className="">
                        <Button className='cta-button' type="primary" shape="round" size="large" loading={isCPLoading} onClick={handleCreatePost}>Create Post <PlusCircleOutlined /></Button>
                      </div>                      
                    </div>

                    <Modal
                      title="Update Profile"
                      visible={visible}
                      onOk={handleOk}
                      confirmLoading={confirmLoading}
                      onCancel={handleCancel}
                      maskClosable={false}
                      closable={true}
                    >
                      <Form {...layout} name="nest-messages" onFinish={onFinish} validateMessages={validateMessages}>
                        <Form.Item
                          name={['user', 'name']}
                          // tooltip="every one will be able to search you with handle"
                          label="name"
                          rules={[
                            {
                              required: true,
                              message: 'Please input your handle!',
                            },
                          ]}
                        >
                          <Input />
                        </Form.Item>
{/* 
                        <Form.Item
                          label="Profile Pic"
                        >
                          <input
                            type="file"
                            onChange={onChange}
                          />
                        </Form.Item> */}
                        <Form.Item
                          label="Cover Pic"
                        >
                          <input
                            type="file"
                            onChange={onChange}
                          />
                        </Form.Item>
                        <Form.Item
                          name={['user', 'location']}
                          label="Location"
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          name={['user', 'twitterUrl']}
                          label="Twitter Url"
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          name={['user', 'website']}
                          label="Website Url"
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item name={['user', 'bio']} label="Bio">
                          <Input.TextArea />
                        </Form.Item>
                        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
                          <Button type="primary" htmlType="submit">
                            Submit
                          </Button>
                        </Form.Item>
                      </Form>
                    </Modal>
                    
                    <Modal
                      title="Create Post"
                      visible={cpvisible}
                      onOk={handleOk}
                      confirmLoading={confirmLoading}
                      onCancel={handleCancel}
                      maskClosable={false}
                      closable={true}
                    >
                      <Form {...layout} name="nest-messages" onFinish={onPostFinish} validateMessages={validateMessages}>
                        <Form.Item
                          name={['user', 'post']}
                          // tooltip="every one will be able to search you with handle"
                          label="post"
                          rules={[
                            {
                              required: true,
                              message: 'Please input your post!',
                            },
                          ]}
                        >
                           <Input.TextArea rows="5" />
                        </Form.Item>
                        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
                          <Button type="primary" htmlType="submit">
                            Submit
                          </Button>
                        </Form.Item>
                      </Form>
                    </Modal>


                    <Tabs defaultActiveKey="1" onChange={callback}>
                      <TabPane tab="Publications" key="1">
                        Publications
                      </TabPane>
                      <TabPane tab="Posts" key="2">
                        Posts
                      </TabPane>
                      <TabPane tab="Mirrors" key="3">
                        Mirrors
                      </TabPane>
                    </Tabs>
                  </div>
                </div>
              </main>
            </>
          ) : (
            <div className="NoNft">Profile not available</div>
          )
        }
      </div>
    </div>
  )
}

export default ShowProfile;