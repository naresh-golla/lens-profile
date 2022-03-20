import React, { useContext, useEffect, useState } from 'react'
import { UserDataContext } from "../allContextProvider"
import { Image } from 'antd';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const RenderNfts = () => {

    const [nft, setNft] = useState(null);

    const user_Data_Context = useContext(UserDataContext)
    console.log("user_Data_Context--NFT-->", user_Data_Context)
    let {nftData} = user_Data_Context.userData

    useEffect(()=>{
        setNft(nftData)
    },[nftData])

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
                ) : (<div className="NoNft">No Nft's available in Mumbai TestNet</div>) 

            }
        </div>
    )
}

export default RenderNfts