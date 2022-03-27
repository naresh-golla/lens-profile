import React, { useContext, useEffect, useState } from 'react'
import { get, isNil, trimEnd ,isObject } from "lodash"
import { getProfiles } from './get-profiles';
import { openErrorNotification, openSuccessNotification } from '../utils/ResuableFunctions';
import "../css/ShowProfile.css"
import { Button, Tabs, Modal, Form, Input ,Spin, List, Avatar, Space, Tooltip,Comment ,Select } from 'antd';
import { Link, Navigate, NavLink } from 'react-router-dom';
import { pinFileToIPFS0 } from './exp';
import { updateProfile } from './update-profile';
import { LoadingOutlined, EditOutlined,PlusCircleOutlined ,HeartOutlined,
  MessageOutlined, LikeOutlined, StarOutlined , FormOutlined  } from '@ant-design/icons';
import defImage from "../assets/lp.jpg"
import coverImage from "../assets/cover.PNG"
import { pinJSONToIPFS } from './pinataJsonToIpfs';
import { createPostTypedData } from './create-post-typed-data';
import { getAddressFromSigner, signedTypeData, splitSignature } from './ethers-service';
import { lensHub } from './lens-hub';
import { UserDataContext } from '../allContextProvider';
import { pollUntilIndexed } from './has-transaction-been-indexed';
import { getPublications } from './get-publications';
import {createCommentTypedData} from "./create-comment-typed-data"
import { createFollowTypedData } from './create-follow-typed-data';
import { following } from './following';
import { LoneSchemaDefinitionRule } from 'graphql';
import { followers } from './follower';


const { TabPane } = Tabs;
const { Option } = Select;


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
const comment = [
  {
    actions: [<span key="comment-list-reply-to-0">Reply to</span>],
    author: 'Han Solo',
    avatar: 'https://joeschmoe.io/api/v1/random',
    content: (
      <p>
        We supply a series of design principles, practical patterns and high quality design
        resources (Sketch and Axure), to help people create their product prototypes beautifully and
        efficiently.
      </p>
    ),
    // datetime: (
    //   <Tooltip title={moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss')}>
    //     <span>{moment().subtract(1, 'days').fromNow()}</span>
    //   </Tooltip>
    // ),
  },
  {
    actions: [<span key="comment-list-reply-to-0">Reply to</span>],
    author: 'Han Solo',
    avatar: 'https://joeschmoe.io/api/v1/random',
    content: (
      <p>
        We supply a series of design principles, practical patterns and high quality design
        resources (Sketch and Axure), to help people create their product prototypes beautifully and
        efficiently.
      </p>
    ),
    // datetime: (
    //   <Tooltip title={moment().subtract(2, 'days').format('YYYY-MM-DD HH:mm:ss')}>
    //     <span>{moment().subtract(2, 'days').fromNow()}</span>
    //   </Tooltip>
    // ),
  },
];
const ShowProfile = () => {
  const [idData, setIdData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [isCPLoading, setCPIsLoading] = useState(false)
  const [isHCLoading, setHCIsLoading] = useState(false)
  const [txHash, setTxHash] = useState("")    

  const [visible, setVisible] = React.useState(false);  
  const [cpvisible, setcpVisible] = React.useState(false);
  const [isHCvisible, setHCVisible] = React.useState(false);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [modalText, setModalText] = React.useState('Content of the modal');
  const [fileUrl, updateFileUrl] = useState(null);
  const [spinner, setSpinner] = useState(false);
  const [successCallRender, setSuccessCallRender] = useState(false)
  const [signedInAddress, setSignedInAddress] = useState("")
  const [publications, setPublications] = useState("")
  const [showComments, setShowComments] = React.useState(false);
  const [hCItemIdProfileId, setHCItemIdProfileId] = React.useState("");
  const [followingData, setFollowingData] = React.useState(null);
  const [showFollowingModal, setShowFollowingModal] = React.useState(false);
  const [followersData, setFollowersData] = React.useState(null);
  const [showFollowersModal, setShowFollowersModal] = React.useState(false);

  // let idUrl = window.location.pathname.slice(10)
  let setidUrl = document.location.href.split('/');
  let idUrl = setidUrl[4];
  console.log("query idUrl", idUrl)

  const user_Data_Context = useContext(UserDataContext)
  console.log("user_Data_Context--NFT-->", user_Data_Context)
  let {userAddress,userHandles} = user_Data_Context.userData
  let currentAccount = localStorage.getItem("currentAccount")
  let userHandlesLS = localStorage.getItem("userHandles")
  let parseUserHandlesLS = JSON.parse(userHandlesLS);

  // let userHandles = user_Data_Context.userData
  // console.log("userHandles-++",userHandles)

  const onChange = async (e) => {
    const file = await e.target.files[0];
    updateFileUrl(file)
  }
  let signAddress =   userAddress || currentAccount
  let userHandlesOr = userHandles || parseUserHandlesLS

  useEffect(() => {
    handleRenderProfiles();
    renderPublications();
    setSignedInAddress(signAddress)

  }, [])

  useEffect(()=>{
    setSignedInAddress(signAddress)
  },[ userAddress, currentAccount])

  useEffect(()=>{
    console.log("signAddress",signAddress)
  },[signAddress])

  useEffect(() => {
    handleRenderProfiles();
    renderPublications();
    // console.log("signAddress",signAddress);
    // console.log("signAddress id-",idData[0].ownedBy.toLocaleLowerCase());
  }, [idData])

  useEffect(()=>{
    if(txHash !== ""){
      fetchIndex()      
    }
  },[txHash])

  useEffect(()=>{
    
    renderPosts()
  },[publications])

  useEffect(()=>{
    console.log("followingData",followingData)
  },[followingData])

  const renderPublications = async()=>{
    let reqObj = {
      profileId: idUrl,
      publicationTypes: ["POST", "COMMENT", "MIRROR"]
    }
    let publicationsRes = await getPublications(reqObj)
    console.log("publications",publicationsRes)
    let data  = get(publicationsRes, ["data","publications","items"],[])
    setPublications(data)
    console.log("publications-->data",data)
  }

  async function fetchIndex() {
    let resHRP = await pollUntilIndexed(txHash)
    console.log("resHRP------------>",resHRP)
  }

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
    setHCVisible(false)
    setShowFollowingModal(false)
    setShowFollowersModal(false)
  };

  const handleRenderProfiles = async () => {
    let obj = { profileIds: [idUrl], limit: 10 }
    try {
      const res = await getProfiles(obj)
      let data = await get(res, ["data", "profiles", "items"], []);
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
    setSpinner(true)
    let {post} = values.user
    console.log("idData-->>",idData)
    console.log("handle", values.user)
    // let obj = new Object();
    // obj.post = post
    const resIpfsPost = await pinJSONToIPFS(post)
    console.log("resIpfsPost",resIpfsPost)
    if(resIpfsPost.success){
      try {
        let resIpfsPostUrl = await resIpfsPost.pinataUrl
        console.log("resIpfsPost",resIpfsPostUrl)
  
        let createPostReqObj = {
          profileId: idUrl,
          contentURI: resIpfsPostUrl,
          // collectModule: {
          //   timedFeeCollectModule: {
          //       amount: {
          //          currency: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
          //          value: "0.01"
          //        },
          //        recipient: userAddress || currentAccount,
          //        referralFee: 10.5
          //    }
          // },
          collectModule: {
            emptyCollectModule: true
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
        setTxHash(tx.hash)
        openSuccessNotification("success","Post posted succesfully")
        setSpinner(false);
        setcpVisible(false);
        setCPIsLoading(false);
        // 0x64464dc0de5aac614a82dfd946fc0e17105ff6ed177b7d677ddb88ec772c52d3
        // you can look at how to know when its been indexed here: 
        //   - https://docs.lens.dev/docs/has-transaction-been-indexed
      
      } catch (error) {
        setSpinner(false);
        setcpVisible(false);
        setCPIsLoading(false);
        openErrorNotification("Error",`Post not created :  ${error.message}`)
      }
     
    
    }else{
      setSpinner(false);
      setcpVisible(false);
      openErrorNotification("Error","While converting text to IPFS")
    }
  }

  const onCommentFinish = async (values)=>{
    setSpinner(true)
    let {comment} = values.user
    let {handle} = values;
    console.log("values....",values)
    console.log("idData-->>",idData)
    console.log("handl-finish-00", handle)
    // let obj = new Object();
    // obj.comment = comment
    const resIpfsPost = await pinJSONToIPFS(comment)
    console.log("resIpfsPost-res",resIpfsPost)
    if(resIpfsPost.success){
      try {
        let resIpfsPostUrl = await resIpfsPost.pinataUrl
        console.log("resIpfsPost-url->",resIpfsPostUrl)
  
        let createCommentRequest = {
          profileId: handle,
          publicationId: hCItemIdProfileId,
          contentURI: resIpfsPostUrl,
          
          // collectModule: {
          //   timedFeeCollectModule: {
          //       amount: {
          //          currency: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
          //          value: "0.01"
          //        },
          //        recipient: userAddress || currentAccount,
          //        referralFee: 10.5
          //    }
          // },
          collectModule: {
            emptyCollectModule: true
        },
          referenceModule: {
              followerOnlyReferenceModule: false
          }
        } 
        console.log("createCommentRequest-->",createCommentRequest)
        const result = await createCommentTypedData(createCommentRequest);
        const typedData = result.data.createCommentTypedData.typedData;
        
        const signature = await signedTypeData(typedData.domain, typedData.types, typedData.value);
        const { v, r, s } = splitSignature(signature);
        
        const tx = await lensHub.commentWithSig({
          profileId: typedData.value.profileId,
          contentURI: typedData.value.contentURI,
          profileIdPointed: typedData.value.profileIdPointed,
          pubIdPointed: typedData.value.pubIdPointed,
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
        console.log(tx.hash);
        setTxHash(tx.hash)
        openSuccessNotification("success","comment posted succesfully")
        setSpinner(false);
        setHCVisible(false);
        setHCIsLoading(false);
        // 0x64464dc0de5aac614a82dfd946fc0e17105ff6ed177b7d677ddb88ec772c52d3
        // you can look at how to know when its been indexed here: 
        //   - https://docs.lens.dev/docs/has-transaction-been-indexed
      
      } catch (error) {
        setSpinner(false);
        setHCVisible(false);
        setHCIsLoading(false);
        openErrorNotification("Error",`Post not created :  ${error.message}`)
      }
     
    
    }else{
      setSpinner(false);
      setHCVisible(false);
      setHCIsLoading(false);
      openErrorNotification("Error","While converting text to IPFS")
    }

  }

  const handleCreatePost = ()=>{
    setCPIsLoading(!isCPLoading);
    setcpVisible(!cpvisible)
  }

  const handleCommentPost = (id)=>{
    setHCIsLoading(!isCPLoading);
    setHCVisible(!isHCvisible);
    // setHCItemIdProfileId(prevState=>({
    //   ...prevState,
    //   hcItemId : id,
    //   hcProfileId : profileId
    // }))    
    setHCItemIdProfileId(id)
  }

  const handleShowComments = ()=>{
    setShowComments(!showComments)
  }

  const IconText = ({ icon, text }) => (
    <Space>
      {React.createElement(icon)}
      {text}
    </Space>
  );

  const renderPosts=()=>{
    if(publications.length >0 ){
      let postsPub = publications.filter(item=>{
        return item.__typename === "Post"
      })      
      let commentsPub = publications.filter(item=>{
        return item.__typename === "Comment"
      })   
      console.log("postsPub",postsPub);
      console.log("commentsPub",commentsPub);
      return (
        <List
        itemLayout="vertical"
        size="large"
        pagination={{
          onChange: page => {
            console.log(page);
          },
          pageSize: 3,
        }}
        dataSource={postsPub}
        // footer={
        //   <div>
        //     <b>ant design</b> footer part
        //   </div>
        // }
        renderItem={item => (
          <List.Item
            key={item.title}
            actions={[
              // <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
              // <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
              // <Tooltip title="followers">
              //   <IconText icon={MessageOutlined} text="2" key="list-vertical-message" />
              // </Tooltip>
            ]}
            // extra={
            //   <img
            //     width={272}
            //     alt="logo"
            //     src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
            //   />
            // }
          >
            <List.Item.Meta
              avatar={<Avatar src={(!isNil(item.picture)) ? item.picture.original.url : defImage} />}
              title={item.profile.handle}
              description={item.metadata.content}
            />
            <div class="flex-comments">
              <div onClick={handleShowComments}>
                <Tooltip title="comments">
                     {commentsPub.length} Comments <MessageOutlined /> 
                </Tooltip>
              </div>
              <div onClick={()=>handleCommentPost(item.id)}>
                <Tooltip title="Reply">
                    <FormOutlined /> Comment
                </Tooltip>               
              </div>
            </div>
            
              {showComments && 
                <List
                className="comment-list"
                // header={`${comment.length} replies`}
                itemLayout="horizontal"
                dataSource={commentsPub}
                renderItem={item => (
                  <li>
                    <Comment
                      // actions={[<span key="comment-list-reply-to-0">Reply to</span>]}
                      author={item.profile.handle}
                      avatar={(!isNil(item.picture)) ? item.picture.original.url : defImage}
                      content={item.metadata.content}
                      // datetime={item.datetime}
                    />
                  </li>
                )}
              />
              }
            {item.content}
          </List.Item>
        )}
      />
      )
    }
  }
  
  const renderMirrors=()=>{
    if(publications.length >0 ){

      let mirrorsPub = publications.filter(item=>{
        return item.__typename === "Mirror"
      })   
      console.log("commentsPub",mirrorsPub);
      return (
        <List
        itemLayout="vertical"
        size="large"
        pagination={{
          onChange: page => {
            console.log(page);
          },
          pageSize: 3,
        }}
        dataSource={mirrorsPub}
        // footer={
        //   <div>
        //     <b>ant design</b> footer part
        //   </div>
        // }
        renderItem={item => (
          <List.Item
            key={item.title}
            actions={[
              // <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
              // <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
              // <Tooltip title="followers">
              //   <IconText icon={MessageOutlined} text="2" key="list-vertical-message" />
              // </Tooltip>
            ]}
            // extra={
            //   <img
            //     width={272}
            //     alt="logo"
            //     src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
            //   />
            // }
          >
            <List.Item.Meta
              avatar={<Avatar src={(!isNil(item.picture)) ? item.picture.original.url : defImage} />}
              title={item.profile.handle}
              description={item.metadata.content}
            />
            {item.content}
          </List.Item>
        )}
      />
      )
    }
  }
  const handleFollowButton = async(id)=>{
    console.log("handleFollowButton",id)
    const followRequest = [
      {
        profile: id,
        followModule: null
      }
    ];
    console.log("followRequest",followRequest)
    const result = await createFollowTypedData(followRequest);
    console.log('follow: result', result);
  
    const typedData = result.data.createFollowTypedData.typedData;
    console.log('follow: typedData', typedData);
  
    const signature = await signedTypeData(typedData.domain, typedData.types, typedData.value);
    console.log('follow: signature', signature);
  
    const { v, r, s } = splitSignature(signature);
  
    const tx = await lensHub.followWithSig({
      follower: getAddressFromSigner(),
      profileIds: typedData.value.profileIds,
      datas: typedData.value.datas,
      sig: {
        v,
        r,
        s,
        deadline: typedData.value.deadline,
      },
    });
    console.log('follow: tx hash', tx.hash);
    return tx.hash;
    // 0x64464dc0de5aac614a82dfd946fc0e17105ff6ed177b7d677ddb88ec772c52d3
    // you can look at how to know when its been indexed here: 
    //   - https://docs.lens.dev/docs/has-transaction-been-indexed
  }

  const getFollowing = async (address)=>{
    setShowFollowingModal(!showFollowingModal)
    try {
      let res = await following(address)
      let data = get(res,["data","following","items"],[])
      console.log("res-->",res)
      setFollowingData(data)  
      // setShowFollowingModal(false)    
      openSuccessNotification("success","Following profiles succesfully loaded")
    } catch (error) {
      setShowFollowingModal(false)
      openErrorNotification("error",error.message)
    }
  }
  
  const getFollowers = async (address)=>{
    setShowFollowersModal(!showFollowersModal)
    try {
      let res = await followers(address)
      let data = get(res,["data","following","items"],[])
      console.log("res-->",res)
      setFollowersData(data)  
      // setShowFollowingModal(false)    
      openSuccessNotification("success","Followers profiles succesfully loaded")
    } catch (error) {
      setShowFollowersModal(false)
      openErrorNotification("error",error.message)
    }
  }

  const handleChangeProfile = (id)=>{
    console.log("loc id",id);
    let setidUrl = window.location.href.split('/');
    let idUrl = setidUrl[4];
    console.log("loc idUrl", idUrl)
    console.log("loc pathname", window.location.pathname)
    window.location.pathname = `/explore/${id}`
    console.log("loc path2 ", window.location.pathname)
    window.location.reload()
  }

  const antIcon = <LoadingOutlined style={{ fontSize: 50, textAlign: "center" }} spin />
  return (
    <div className="showProfileDiv">
      {spinner && <div className="spinnerWrapper"><Spin indicator={antIcon} /></div>}
      <div className="container">
        {
          isNil(idData) ? <div className="spinnerWrapper"><Spin indicator={antIcon} /></div> :
          (!isNil(idData) && idData.length > 0) ? (
            <>             
              <header className="showProfileHeader"
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
                      <img alt="Profile Pic" className="photo"
                        src={(!isNil(idData[0].picture)) ? idData[0].picture.original.url : defImage}
                      />
                    </div>
                    <h4 className="name">{idData[0].name}</h4>
                    <p className="info">{idData[0].handle}</p>
                    <p className="location">
                      {!isNil(idData[0].location) && <i className="fa fa-map-marker" aria-hidden="true"></i>}
                      <span>{idData[0].location}</span>
                    </p>
                    <div className="stats row">
                      <div className="stat col-xs-4 followers" onClick={()=>getFollowers(idData[0].ownedBy)} style={{ paddingRight: "50px" }}>
                        <p className="number-stat">{idData[0].stats.totalFollowers}</p>
                        <p className="desc-stat">Followers</p>
                      </div>
                      <div className="stat col-xs-4 following" onClick={()=>getFollowing(idData[0].ownedBy)}>
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
                    {
                      idData[0].ownedBy && idData[0].ownedBy.toLocaleLowerCase() !== signAddress ? (
                        <div className="buttonList">
                        <div className="">
                          <Button className='cta-button' type="primary" shape="round" size="large" loading={isFollowLoading} onClick={()=>handleFollowButton(idData[0].id)}>Follow<HeartOutlined /></Button>
                        </div>                  
                      </div>
                      ) : (
                        <div className="buttonList">
                        <div className="">
                          <Button className='cta-button' type="primary" shape="round" size="large" loading={isLoading} onClick={handleEditProfile}>Edit Profile <EditOutlined /></Button>
                        </div>
                        <div className="">
                          <Button className='cta-button' type="primary" shape="round" size="large" loading={isCPLoading} onClick={handleCreatePost}>Create Post <PlusCircleOutlined /></Button>
                        </div>                      
                      </div>
                      )
                    }

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
                    
                    {/* Create Post Modal */}
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
                    
                    {/* Create Comment Modal */}
                    <Modal
                      title="Create Comment"
                      visible={isHCvisible}
                      onOk={handleOk}
                      confirmLoading={confirmLoading}
                      onCancel={handleCancel}
                      maskClosable={false}
                      closable={true}
                    >
                      <Form {...layout} name="nest-messages" onFinish={onCommentFinish} validateMessages={validateMessages}>
                        <Form.Item
                          name={['user', 'comment']}
                          // tooltip="every one will be able to search you with handle"
                          label="Comment"
                          rules={[
                            {
                              required: true,
                              message: 'Please input your comment!',
                            },
                          ]}
                        >
                           <Input.TextArea rows="5" />
                        </Form.Item>
                          <Form.Item
                            name="handle"
                            label="Handle"
                            rules={[{ required: true, message: 'choose your desired profile to comment!' }]}
                          >
                            <Select placeholder="choose your desired profile to comment">
                              {
                                !isNil(userHandlesOr) && userHandlesOr.length > 0 && userHandlesOr.map((item,index)=>{
                                  return <Option key={index} value={item[0]}>{item[1]}</Option>
                                })

                              }
                            </Select>
                          </Form.Item>
                        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
                          <Button type="primary" htmlType="submit">
                            Submit
                          </Button>
                        </Form.Item>
                      </Form>
                    </Modal>


                    {/* Create Following Modal */}
                    {<Modal
                      title="Following"
                      visible={showFollowingModal}
                      onOk={handleOk}
                      confirmLoading={confirmLoading}
                      onCancel={handleCancel}
                      maskClosable={false}
                      closable={true}
                    >
                      { 
                      !isNil(followingData) && followingData.length > 0 && <List
                        itemLayout="horizontal"
                        dataSource={followingData}
                        renderItem={item => (
                          <List.Item>                            
                            <List.Item.Meta
                              avatar={<Avatar src={(!isNil(item.profile.picture)) ? item.profile.picture.original.url : defImage} />}
                              title={<a href="javasript:viod(0)"><span>{item.profile.handle}</span></a>}
                              // title={<a href="javasript:viod(0)"><span onClick={()=>handleChangeProfile(item.profile.id)}>{item.profile.handle}</span></a>}
                              description={item.profile.bio && item.profile.bio.slice(0,50) + "..."}
                            />      
                          </List.Item>
                        )}
                      />}
                    </Modal>
                    }

                    {/* Create Followers Modal */}
                    {<Modal
                      title="Followers"
                      visible={showFollowersModal}
                      onOk={handleOk}
                      confirmLoading={confirmLoading}
                      onCancel={handleCancel}
                      maskClosable={false}
                      closable={true}
                    >
                      { 
                      !isNil(followersData) && followersData.length > 0 && <List
                        itemLayout="horizontal"
                        dataSource={followersData}
                        renderItem={item => (
                          <List.Item>                            
                            <List.Item.Meta
                              avatar={<Avatar src={(!isNil(item.profile.picture)) ? item.profile.picture.original.url : defImage} />}
                              title={<a href="javasript:viod(0)"><span>{item.profile.handle}</span></a>}
                              // title={<a href="javasript:viod(0)"><span onClick={()=>handleChangeProfile(item.profile.id)}>{item.profile.handle}</span></a>}
                              description={item.profile.bio && item.profile.bio.slice(0,50) + "..."}
                            />      
                          </List.Item>
                        )}
                      />}
                    </Modal>
                    }

                    <Tabs defaultActiveKey="1" onChange={callback}>
                      <TabPane tab="Posts" key="1">
                        {renderPosts()}
                      </TabPane>
                      <TabPane tab="Mirrors" key="2">
                        {renderMirrors()}
                      </TabPane>
                    </Tabs>
                  </div>
                </div>
              </main>
            </>
          ) : (
            <div class="sp-bg"><div className="NoNft sp">Profile not available</div></div>
          )
        }
      </div>
    </div>
  )
}

export default ShowProfile;