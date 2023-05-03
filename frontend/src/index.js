import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SellNFT from "./components/SellNFT";
import Marketplace from "./components/Marketplace";
import VerifyProperty from "./components/VerifyProperty";
import Profile from "./components/Profile";
import NFTPage from "./components/NFTpage";
import LandingSection from "./components/LandingSection";
import AddVerifier from "./components/AddVerifier";
import ProfileNFTpage from "./components/ProfileNFTpage";
import UnverifiedNFTpage from "./components/UnverifiedNFTpage";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingSection />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/verifyProperty" element={<VerifyProperty />} />
        <Route path="/addVerifier" element={<AddVerifier />} />
        <Route path="/sellNFT" element={<SellNFT />} />
        <Route path="/nftPage/:tokenId" element={<NFTPage />} />
        <Route path="/unverified-nft-page/:tokenId" element={<UnverifiedNFTpage />} />
        <Route path="/profileNFT/:tokenId" element={<ProfileNFTpage />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
