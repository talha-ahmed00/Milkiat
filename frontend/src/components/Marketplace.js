import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import LandingSection from "./LandingSection";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";
import "./Spinner.css";
import "./Marketplace.css";

export default function Marketplace() {
  const sampleData = [];

  const [data, updateData] = useState(sampleData);
  const [dataFetched, updateFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setWalletConnected(true);
      } else {
        setWalletConnected(false);
      }
    }
  };

  useEffect(() => {
    checkWalletConnection();
  }, []);

  async function getAllNFTs() {
    setLoading(true);
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(
      MarketplaceJSON.address,
      MarketplaceJSON.abi,
      signer
    );
    let transaction = await contract.getAllListedNFTs();

    const items = await Promise.all(
      transaction.map(async (i) => {
        let tokenURI = await contract.tokenURI(i.tokenId);
        let meta = await axios.get(tokenURI.replace('https://gateway.pinata.cloud/ipfs', 'https://ipfs.io/ipfs'));
        meta = meta.data;

        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.image,
          name: meta.name,
          address: meta.address,
          typeofhouse: meta.typeofhouse,
          sqaureyards: meta.sqaureyards,
          bedrooms: meta.bedrooms,
          yearbuilt: meta.yearbuilt,
        };
        return item;
      })
    );

    updateFetched(true);
    updateData(items);
    setLoading(false);
  }

  useEffect(() => {
    if (!dataFetched && walletConnected) {
      getAllNFTs();
    }
  }, [dataFetched, walletConnected]);

  return (
    <div>
      <Navbar />
      <div className="flex flex-col place-items-center mt-20">
        <div className="welcome-text text-white font-bold text-center mx-10">
        Welcome To The Milkiat Marketplace
        </div>
        <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
          {walletConnected ? (
            loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm12 0a8 8 0 00-8-8V0c6.627 0 12 5.373 12 12h-4zm-4 4a4 4 0 110-8 4 4 0 010 8zm0 4a8 8 0 100-16 8 8 0 000 16z"
                  ></path>
                </svg>
              </div>
            ) : data.length > 0 ? (
              data.map((value, index) => {
                return <NFTTile data={value} key={index}></NFTTile>;
              })
            ) : (
              <div className="text-white text-lg">
                There's no property for sale at this moment.
              </div>
              )
            ) : (
              <div className="text-white text-lg">
                Please login to view Properties
              </div>
              )}
      </div>
    </div>
</div>
);
}
