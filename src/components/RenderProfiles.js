import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserDataContext ,setUserData } from "../allContextProvider"
import { LoadingOutlined, EditOutlined, EllipsisOutlined, SettingOutlined, UserAddOutlined, UsergroupAddOutlined, MessageOutlined } from '@ant-design/icons';
import { Card, Avatar, Spin, Image, Tooltip,Badge } from 'antd';
import { get, isNil, trimEnd } from "lodash"
import { Link, Outlet } from 'react-router-dom';
import { getProfiles } from './get-profiles';
import { openErrorNotification } from '../utils/ResuableFunctions';
import defImage from "../assets/lp.jpg"

const { Meta } = Card;


const RenderProfiles = () => {

  const [profiles, setProfiles] = useState(null);
  const userContextProfiles = useContext(UserDataContext)
  let { userAddress } = userContextProfiles.userData

  // const user_Data_Context = useContext(UserDataContext)
  console.log("userContextProfiles", userContextProfiles)

  let currentAccount = localStorage.getItem("currentAccount")

  useEffect(() => {
    handleRenderProfiles()
  }, [userAddress,currentAccount])

  // useEffect(()=>{
  //   setProfiles(profileData)
  // },[profileData])

  // setting profiles to global state
    useEffect(()=>{
      if(!isNil(profiles) && profiles.length > 0){
        let obj ={}
        let convertToObj = profiles.map(item=>{
          // console.log("item",item.id , ":", item.handle)
          obj[item.id] = item.handle
          // return {item.id ,":", item.handle}
        })
        // console.log("setProfiles",convertToObj)
        
        let convertToArray = Object.entries(obj)
        console.log("setProfiles--",convertToArray)
        localStorage.setItem("userHandles",JSON.stringify(convertToArray))
        userContextProfiles.setUserData(prevState =>({
          ...prevState,
          userHandles:convertToArray
        })) 
      }

    },[profiles])


  const handleRenderProfiles = async () => {
    let obj = { ownedBy: [userAddress || currentAccount], limit: 30 }
    if(obj.ownedBy[0].length>0){
      try {
        const res = await getProfiles(obj)
        let data = await get(res, ["data", "profiles", "items"], null);
        setProfiles(data)
        console.log("profiles", data)
      } catch (error) {
        openErrorNotification("Error while loading Profile's", error.message)
        console.log("profiles", error.message)
      }      
    }
  }


  console.log("userAddress", userAddress)

  const antIcon = <LoadingOutlined style={{ fontSize: 50, textAlign: "center" }} spin />
  let defaultImg = `https://gateway.pinata.cloud/ipfs/QmY9dUwYu67puaWBMxRKW98LPbXCznPwHUbhX5NeWnCJbX`

  return (
    <div className="nft-wrapper">
      <h5 class="color-white">Your Profiles</h5>
      {
        profiles === null ? (
          <Spin indicator={antIcon} />
        ) :
          profiles && profiles.length > 0 ? (
            <div className="profile-wrapper">
              {
                profiles.map((item, index) => {
                  let bio= (item.bio !== "" && item.bio !== null) && item.bio.slice(0,50) + "..." ;
                  return (
                    <Card
                      key={index}
                      style={{ width: 250 }}
                      cover={
                        <>
                          <Link to={item.id} className="link-class"> </Link>
                          <img
                            alt="Cover Pic"
                            src={(!isNil(item.picture)) ? item.picture.original.url : defImage}
                          />
                        </>
                      }
                      actions={[
                        <Tooltip title="following">
                          {item.stats.totalFollowing > 0 ? (<Badge count={item.stats.totalFollowing}><UserAddOutlined style={{fontSize:"22px"}} key="following" /></Badge>) : (
                            <UserAddOutlined style={{fontSize:"22px"}} key="following" />
                          )}                                                     
                        </Tooltip>,
                        <Tooltip title="Edit Profile">{}
                          <EditOutlined style={{fontSize:"22px"}}  key="edit" />                          
                        </Tooltip>,
                        <Tooltip title="followers">
                           {item.stats.totalFollowers > 0 ? ( <Badge count={item.stats.totalFollowers}><UsergroupAddOutlined style={{fontSize:"22px"}} key="followers"/></Badge>) :(
                             <UsergroupAddOutlined style={{fontSize:"22px"}} key="followers"/>
                           )}                         
                        </Tooltip>,
                        <Tooltip title="posts">
                          {item.stats.totalPosts > 0 ? (<Badge count={item.stats.totalPosts}><MessageOutlined style={{fontSize:"22px"}}/></Badge>) : (
                            <MessageOutlined style={{fontSize:"22px"}}/>
                          )}
                        </Tooltip>

                      ]}
                    >
                      <Meta
                        avatar={<Avatar src={(!isNil(item.picture)) ? item.picture.original.url : defImage} />}
                        title={item.handle}
                        description={bio || " "}
                      />
                    </Card>
                  )
                })
              }
            </div>

          ) : (<div className="NoNft">No Profile's available for this account</div>)

      }
    </div>
  )
}

export default RenderProfiles;