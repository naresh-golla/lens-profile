import React,{useEffect,useState} from 'react'
import { get, isNil, trimEnd } from "lodash"
import { getProfiles } from './get-profiles';
import { openErrorNotification } from '../utils/ResuableFunctions';

const ShowProfile = () => {
  const [idData, setIdData] = useState(null)

  let idUrl = window.location.pathname.slice(10)
  console.log("query idUrl",idUrl)

  useEffect(() => {
    handleRenderProfiles();
  }, [])

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
    
  return (
    <div>
       data
    </div>
  )
}

export default ShowProfile;