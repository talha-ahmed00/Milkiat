import React, { useState, useEffect } from "react";
import "./landingpage.css";
import Navbar from "./Navbar";
import { ethers } from "ethers";
import MarketplaceJSON from "../Marketplace.json";

function LandingSection() {
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  async function checkWalletConnection() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        setWalletConnected(true);
      }
    }
  }

  async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      setWalletConnected(true);
    } else {
      alert("Please install MetaMask to connect your wallet.");
    }
  }

  function goToMarketplace() {
    window.location.href = "/marketplace";
  }

  return (
    <div>
      <Navbar />
      <div className="marketplace-container">
        <div className="marketplace-header">
          <p>
            <span className="light__text">
              Welcome to <br />{" "}
            </span>{" "}
            <br />
            <span> Milkiat</span>
          </p>
          {walletConnected ? (
            <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={goToMarketplace}>
              Go To Marketplace
            </button>
          ) : (
            <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
        <div>{/* <PropertyCard /> */}</div>
      </div>
    </div>
  );
}

export default LandingSection;
