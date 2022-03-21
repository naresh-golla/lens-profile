import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import RenderNfts from './components/RenderNfts';
import {UserDataProvider} from "./allContextProvider";
import CreateProfile from './components/CreateProfile';
import RenderProfiles from './components/RenderProfiles';

ReactDOM.render(
  <React.StrictMode>
    <UserDataProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="nft" element={<RenderNfts />} />        
          <Route path="create-profile" element={<CreateProfile />} />        
          <Route path="profiles" element={<RenderProfiles />} />        
        </Route>
      </Routes>
      </BrowserRouter>      
    </UserDataProvider>

  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
