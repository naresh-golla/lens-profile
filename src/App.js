import './App.css';
import {useEffect} from "react"
import { apolloClient } from './components/apollo-client';
import { gql } from '@apollo/client'
import LandingPage from './components/LandingPage';

// const query  = `
//   query {
//     ping
//   }
// `

// const queryExample = async () => {
//    const response = await apolloClient.query({
//     query: gql(query),
//   })
//   console.log('Lens example data: ', response)
// }

// const query = `
//   challenge(request: $request) {
//     text
//   }
// `

// const queryExampleReq = async () => {
//    const response = await apolloClient.query({
//     query: gql(query),
//     variables: {
//       request: {
//          address: "0x633E8B8aDCE8d98EbC2ae2b8ef2d176221e58a70"
//       },
//     },
//   })
//   console.log('Lens queryExampleReq: ', response)
// }

function App() {
  useEffect(()=>{
    // queryExample();
    // queryExampleReq()
  },[])

  return (
    <div className="App">
      <LandingPage />
    </div>
  );
}

export default App;
