import React, { useEffect,useState } from 'react'
import { getRecommendedProfiles } from './recommended-profiles';
import { LoadingOutlined, EditOutlined, EllipsisOutlined, SettingOutlined, 
  UserAddOutlined, UsergroupAddOutlined, MessageOutlined ,BarsOutlined} from '@ant-design/icons';
import { Card, Avatar, Spin, Image, Tooltip,Badge } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import { get,isNil } from "lodash";
import defImage from "../assets/lp.jpg"

const { Meta } = Card;

const ExploreModule = () => {

    const [trendingProfiles,setTrendingProfiles] = useState([])

    useEffect(()=>{
      getRecProfile();
    },[])

    const getRecProfile = async ()=>{
      let getProfiles = await getRecommendedProfiles()
      let data = get(getProfiles, ["data","recommendedProfiles"], []);
      setTrendingProfiles(data)
      console.log("getRecommendedProfiles", data)      
      console.log("getRecommendedProfiles")      
    }

  return (
    <div class="nft-wrapper u-mt-100">   
      {/* {
        (trendingProfiles.length > 0) && <List
          itemLayout="horizontal"
          dataSource={trendingProfiles}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={(!isNil(item.picture) &&  item.picture.original.url) ? <Avatar src={item.picture.original.url}/>:""}
                title={item.name}
                description={item.bio}
              />
            </List.Item>
          )}
        />
      } */}
      <h5 class="color-white u-ml-40">Explore Trending Profiles</h5>
      <div className="profile-wrapper ppl">
        {
          (trendingProfiles.length > 0) ? (
            trendingProfiles.map((item,index)=>{
              let bio = (item.bio !== "" && item.bio !== null) && item.bio.slice(0,50) + "..." ;
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
                    <Tooltip title="collections">
                      {item.stats.totalCollects > 0 ? ( <Badge count={item.stats.totalCollects}><BarsOutlined style={{fontSize:"22px"}} key="collections"/></Badge>) :(
                        <BarsOutlined  style={{fontSize:"22px"}} key="followers"/>
                      )}                        
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
          ) : ("")
        }        
      </div>

    </div>
  )
}
export default ExploreModule;







