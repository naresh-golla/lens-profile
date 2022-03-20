import React, { useState, useEffect , useContext} from "react";
import "antd/dist/antd.css";
import { Card, Button } from "antd";
import { networks } from "../utils/networks";
import { generateChallenge } from "./generate-challenge"
import { authenticate } from './authenticate'
import { ethers } from 'ethers';
import { createProfile } from "./profile/create-profile";
import { refreshAuth } from "./refresh-authenticate";
import { get, isArray, map, forEach } from "lodash";
import { Menu, Layout, notification} from "antd";
import { getUsersNfts } from "./get-users-nfts";
import { Link,Outlet  } from "react-router-dom";
import {UserDataContext} from "../allContextProvider"


const { Meta } = Card;
const LandingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [network, setNetwork] = useState('');
  const [Loading, setLoading] = useState(false);

  const user_Data_Context = useContext(UserDataContext)
  console.log("user_Data_Context",user_Data_Context)

  const useInterval = (callback, delay) => {
    const savedCallback = React.useRef();
  
    React.useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    React.useEffect(() => {
      const tick = () => {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  };


  useInterval(() => {
    let refreshToken = localStorage.getItem("refreshToken")
    currentAccount && refreshToken && console.log(refreshAuth(refreshToken))
  }, 600000);

  const openSuccessNotification = (message,description) => {
    notification.success({
      message,
      description,
      placement:"topRight"
    });
  };

  const openErrorNotification = (message,description) => {
    notification.error({
      message,
      description,
      placement:"topRight"
    });
  };

  
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const handleWalletConnect = () => {
    setIsLoading(true);
  }

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("get metamask, https://metamask.io/")
    } else {
      console.log("ethereum obj", ethereum)
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      const account = accounts[0].trim();
      console.log("account",account)
      setCurrentAccount(account)

    } else {
      console.log("No authorised accounts found !")
    }

    const chainId = await ethereum.request({method:"eth_chainId"})
    console.log("chainId",networks[chainId])
    setNetwork(networks[chainId])

    ethereum.on("chainChanged", handlChainChanged);

    function handlChainChanged(_chainId){
      window.location.reload()
    }

  }

  const signText = async (text) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    console.log("signer",signer)
    return await signer.signMessage(text);
  }

  const connectWallet = async () => {
    console.log("connectWallet")
    setIsLoading(!isLoading)
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("get metamask, https://metamask.io/")
        return;
      } else {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length !== 0) {
          const account = accounts[0].trim();
          console.log("Connected with -->", account);
          setCurrentAccount(account)

            // we request a challenge from the server
            const challengeResponse = await generateChallenge(account);
            
            // sign the text with the wallet
            const signature = await signText(challengeResponse.data.challenge.text)
            
            const accessTokens = await authenticate(account, signature);
            console.log("accessTokens-->",accessTokens);
            let accessToken = await accessTokens.data.authenticate.accessToken;
            let refreshToken = await accessTokens.data.authenticate.refreshToken;
            // console.log("accessToken",accessToken)
            // console.log("refreshToken",refreshToken)
            localStorage.setItem("accessToken",accessToken)
            localStorage.setItem("refreshToken",refreshToken)
        }
      }
    } catch (error) {
      console.log("error while connecting wallet", error)
      setIsLoading(false)
    }
  }

  const renderNotConnectedContainer = () => {
    return (
      <div className="center-cont">
          <div>
              <h2>Take ownership of You with a Web3 Decentralized Identity on Lens Profile</h2>
              <h4>With a Web3 Decentralized Identity on Lens Profile communicate your personal story and build communities how you want with crypto, NFT, and blockchain enthusiasts you can trust.</h4>
          </div>

        <div className="center-child">
          <Button className="connect-btn" type="primary" shape="round" size="large" loading={isLoading} onClick={ connectWallet}>Connect Wallet</Button>
        </div>
      </div>
    )
  }

  const handleCreateProfile =async ()=>{
    const profileObj={
      handle: "avatar",
      profilePictureUri: "https://avatarfiles.alphacoders.com/888/thumb-1920-88879.gif",
      followNFTURI: null,
      followModule: null
    }
    try{
      const res = await createProfile(profileObj);
      console.log("red",res)
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

  }
  function toHex(str) {
    var result = '';
    for (var i=0; i<str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }
    return result;
  }

  const showNfts = async ()=>{
    const nftObj = {
      ownerAddress:currentAccount,
      chainIds:[80001],
      limit: 20
    }
    try {
      const res = await getUsersNfts(nftObj)
      let data = await get(res, ["data","nfts","items"], null);
      console.log(data)
      user_Data_Context.setUserData(prevState => ({
        ...prevState,
        nftData: data
      }));
      console.log("nft",res)
    } catch (error) {
      openErrorNotification("Error while loading NFT's",error.message)
      console.log("nft",error.message)
    }
  }

  const renderProfile = ()=>{
      if(network !== "Polygon Mumbai Testnet"){
        return (
            <div className="switchNetwork">
              <h2>Please switch to Polygon Mumbai Testnet</h2>
              <Button className='cta-button' type="primary" shape="round" size="large"  loading={isLoading} onClick={switchNetwork}>Click here to switch</Button>
            </div>
        );
      }
      return (
        <div>
          <div className="buttonSection">
            <div>
              <Link to="/create-profile">
                <Button className='cta-button' type="primary" shape="round" size="large">create profile</Button>
              </Link>
            </div>
            <div>
              <Link to="/nft">
                <Button className='cta-button' type="primary" shape="round" size="large"  onClick={showNfts}>My NFT's</Button>
              </Link>
            </div>
          </div>
          <Outlet />
        </div>
        
      )
  }

  const switchNetwork = async () => {
    setIsLoading(true)
    if (window.ethereum) {
        try {
          // Try to switch to the Mumbai testnet
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x13881' }], // Check networks.js for hexadecimal network ids
          });
        } catch (error) {
          // This error code means that the chain we want has not been added to MetaMask
          // In this case we ask the user to add it to their MetaMask
          if (error.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {	
                    chainId: '0x13881',
                    chainName: 'Polygon Mumbai Testnet',
                    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
                    nativeCurrency: {
                        name: "Mumbai Matic",
                        symbol: "MATIC",
                        decimals: 18
                    },
                    blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
                  },
                ],
              });
              setIsLoading(false)
            } catch (error) {
              console.log(error);
              setIsLoading(false)
            }
          }
          console.log(error);
        }
      } else {
        // If window.ethereum is not found then MetaMask is not installed
        alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
        setIsLoading(false)
      } 
  }

  return (
    <div>
      <header>
        <div className="header-logo-wallet">
          <div className="logo">
            Lens Profile
          </div>
          <div className="wallet">
              {currentAccount ? (
                <a href={`https://mumbai.polygonscan.com/address/${currentAccount}`} rel="noreferrer" target="_blank">
                    <Card
                        hoverable
                        cover={
                        <div style={{ overflow: "hidden", height: "100px" }}>
                        <img
                            alt="example"
                            style={{ height: "100%" }}
                            src={network.includes("Polygon") ?  "https://cryptologos.cc/logos/polygon-matic-logo.png" : "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ethereum_logo_2014.svg/628px-Ethereum_logo_2014.svg.png"}
                        />
                        </div>
                    }
                    >
                    <Meta title={`wallet :  ${currentAccount.slice(0,6)}...${currentAccount.slice(-4)}`} description="" />
                    </Card>
                </a>
              ) : (
                    <Card
                        hoverable
                        onClick={ connectWallet}
                        cover={
                        <div style={{ overflow: "hidden", height: "100px" }}>
                        <img
                            alt="example"
                            style={{ height: "100%" }}
                            src={network.includes("Polygon") ?  "https://cryptologos.cc/logos/polygon-matic-logo.png" : "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ethereum_logo_2014.svg/628px-Ethereum_logo_2014.svg.png"}
                        />
                        </div>
                    }
                    >
                    <Meta title="Wallet Not Connected" description="" />
                    </Card>
              )}

          </div>
        </div>
      </header>
      {!currentAccount && renderNotConnectedContainer()}
      {currentAccount && renderProfile()}
    </div>
  )
}
export default LandingPage;