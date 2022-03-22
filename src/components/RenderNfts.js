import React, { useContext, useEffect, useState } from 'react'
import { UserDataContext } from "../allContextProvider"
import { Image } from 'antd';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { getUsersNfts } from './get-users-nfts';
import { get } from 'lodash';
import { openErrorNotification } from '../utils/ResuableFunctions';

const RenderNfts = () => {

    const [nft, setNft] = useState(null);

    const user_Data_Context = useContext(UserDataContext)
    console.log("user_Data_Context--NFT-->", user_Data_Context)
    let {userAddress} = user_Data_Context.userData


    // useEffect(()=>{
    //     setNft(nftData)
    // },[nftData])

    useEffect(()=>{
        showNfts();
    })

    let currentAccount = sessionStorage.getItem("currentAccount")

    const showNfts = async () => {
        const nftObj = {
          ownerAddress: userAddress || currentAccount,
          chainIds: [80001],
          limit: 20
        }
        try {
          const res = await getUsersNfts(nftObj)
          let data = await get(res, ["data", "nfts", "items"], null);
          console.log(data)
          setNft(data)
          console.log("nft", res)
        } catch (error) {
          openErrorNotification("Error while loading NFT's", error.message)
          console.log("nft", error.message)
        }
      }

    const antIcon = <LoadingOutlined style={{ fontSize: 50 , textAlign:"center"}} spin />

    return (
        <div className="nft-wrapper">
            {   
             nft === null ? (
                <Spin indicator={antIcon} />
            )  :      
                nft && nft.length > 0 ? (
                    <Image.PreviewGroup>
                        {(
                            nft.length > 0 && nft.map(item => {
                                return <Image key={item.name +"_"+ item.tokenId} width={200} src={item.originalContent.uri} />
                            })
                        )}
                    </Image.PreviewGroup>
                ) : (<div className="NoNft">No Nft's available for this connected wallet in Mumbai TestNet</div>) 

            }
        </div>
    )
}

export default RenderNfts