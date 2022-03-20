import './App.css';
import {useEffect} from "react"
import { apolloClient } from './components/apollo-client';
import { gql } from '@apollo/client'
import LandingPage from './components/LandingPage';

function App() {
  useEffect(()=>{

  },[])

  return (
    <div className="App">
      <LandingPage />
    </div>
  );
}

export default App;
