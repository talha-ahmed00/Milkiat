import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import UnverifiedNFTTile from "./UnverifiedNFTTile";
import LandingSection from "./LandingSection";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

function VerifyProperty() {
  const sampleData = [];

  const [data, updateData] = useState(sampleData);
  const [dataFetched, updateFetched] = useState(false);
  const [isVerifier, setIsVerifier] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkIfVerifier = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(
        MarketplaceJSON.address,
        MarketplaceJSON.abi,
        signer
      );
      const isUserVerifier = await contract.isVerifier(userAddress);
      setIsVerifier(isUserVerifier);
    };
    checkIfVerifier();
  }, []);

  async function verifyToken(tokenId) {
    // Call the contract's verifyToken function to set the NFT as verified
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(
      MarketplaceJSON.address,
      MarketplaceJSON.abi,
      signer
    );
    await contract.verifyToken(tokenId, true);
  
    // Update the data state to remove the verified NFT from the list
    updateData(data.filter((item) => item.tokenId !== tokenId));
  }

  async function getAllUnverifiedNFTs() {
    setLoading(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(
      MarketplaceJSON.address,
      MarketplaceJSON.abi,
      signer
    );
  
    let unverifiedNFTs = await contract.getAllUnverifiedNFTs();
    console.log("Unverified NFTs:", unverifiedNFTs);
  
    const items = await Promise.all(
      unverifiedNFTs.map(async (nft) => {
        const tokenId = nft[0].toNumber();
        const owner = nft[1];
        const seller = nft[2];
        const price = ethers.utils.formatUnits(nft[3].toString(), "ether");
  
        const tokenURI = await contract.tokenURI(tokenId);
        const metaResponse = await axios.get(tokenURI.replace('https://gateway.pinata.cloud/ipfs', 'https://ipfs.io/ipfs'));
        const meta = metaResponse.data;
  
        return {
          tokenId,
          owner,
          seller,
          price,
          image: meta.image,
          name: meta.name,
          address: meta.address,
          typeofhouse: meta.typeofhouse,
          sqaureyards: meta.sqaureyards,
          bedrooms: meta.bedrooms,
          yearbuilt: meta.yearbuilt,
        };
      })
    );
  
    updateFetched(true);
    updateData(items);
    setLoading(false);
  }
  useEffect(() => {
    if (!dataFetched) {
      getAllUnverifiedNFTs();
    }
  }, [dataFetched, data]);
  return (
    <div>
      <Navbar />
      {isVerifier ? (
        <div className="flex flex-col place-items-center mt-20">
          <div className="welcome-text text-white font-bold text-center mx-10">
            Welcome To The Milkiat Verification portal
          </div>
          <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
            {loading ? (
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
            ) : data.length === 0 ? (
              <p className="text-white text-lg">
                There are no properties left for verification.
              </p>
            ) : (
              data.map((value, index) => {
                console.log("Data being passed to UnverifiedNFTTile", value);
                return (
                  <UnverifiedNFTTile
                    data={value}
                    key={index}
                    onVerify={verifyToken}
                  ></UnverifiedNFTTile>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="mt-10 text-center">
          <h3 className="text-white text-lg">Access Denied</h3>
          <p>You must be a Verifier to access this page.</p>
        </div>
      )}
    </div>
  );
  
      }
export default VerifyProperty;