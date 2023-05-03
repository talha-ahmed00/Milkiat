import Navbar from "./Navbar";
import { useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function UnverifiedNFTPage() {
    const [data, updateData] = useState({});
    const [dataFetched, updateDataFetched] = useState(false);
    const [message, updateMessage] = useState("");
    const [isVerifier, setIsVerifier] = useState(false);
    const [transactionMessage, setTransactionMessage] = useState("");

  
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

  async function getUnverifiedNFTData(tokenId) {
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(
      MarketplaceJSON.address,
      MarketplaceJSON.abi,
      signer
    );
    const listedToken = await contract.getListedTokenForId(tokenId);
    let tokenURI = await contract.tokenURI(tokenId);
    let meta = await axios.get(
      tokenURI.replace(
        "https://gateway.pinata.cloud/ipfs",
        "https://ipfs.io/ipfs"
      )
    );
    meta = meta.data;

    let item = {
      price: meta.price,
      tokenId: tokenId,
      seller: listedToken.seller,
      owner: listedToken.owner,
      image: meta.image,
      name: meta.name,
      address: meta.address,
      typeofhouse: meta.typeofhouse,
      bedrooms: meta.bedrooms,
      yearbuilt: meta.yearbuilt,
    };
    updateData(item);
    updateDataFetched(true);
  }

  async function verifyNFT(tokenId) {
    try {
      const ethers = require("ethers");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      let contract = new ethers.Contract(
        MarketplaceJSON.address,
        MarketplaceJSON.abi,
        signer
      );
      setTransactionMessage("Verifying the Property... Please Wait");
    let transaction = await contract.verifyToken(tokenId, "true");
    await transaction.wait();

    setTransactionMessage("You successfully verified the Property!");
    setTimeout(() => {
      window.location.replace("/marketplace");
    }, 3000); // Wait for 3 seconds before redirecting
  } catch (e) {
    setTransactionMessage("Verification Error: " + e);
  }
  }

  const params = useParams();
  const tokenId = params.tokenId;
  if (!dataFetched) getUnverifiedNFTData(tokenId);

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      {isVerifier ? (
        <div className="container mx-auto mt-10 px-4 md:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <div className="flex justify-center">
              <img
                src={data.image}
                alt=""
                className="w-full h-auto rounded shadow-md max-w-lg md:max-w-xl"
              />
            </div>
            <div className="text-white space-y-4">
              <h1 className="text-3xl font-bold">{data.name}</h1>
              <p>Address: {data.address}</p>
              <p>Type of Residence: {data.typeofhouse}</p>
              <p>Square Yards: {data.squareyards}</p>
              <p>Bedrooms: {data.bedrooms}</p>
              <p>Year Built: {data.yearbuilt}</p>
              <p>
                Price: <span className="text-yellow-300">{data.price + " ETH"}</span>
              </p>
              <p>
                Owner: <span className="text-sm">{data.owner}</span>
              </p>
              <p>
                Seller: <span className="text-sm">{data.seller}</span>
              </p>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                onClick={() => verifyNFT(tokenId)}
              >
                Verify this Property
              </button>
              
              <div className="mt-3">
      {transactionMessage && (
        <div className="p-4 rounded shadow-md">
          <span
            className={`font-semibold ${
              transactionMessage.startsWith("You successfully")
                ? "text-green-500"
                : transactionMessage.startsWith("Verifying the Property")
                ? "text-yellow-500"
                : "text-red-500"
            }`}
          >
            {transactionMessage}
          </span>
        </div>
      )}
    </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-10 text-center">
          <h3 className="text-xl font-bold">Access Denied</h3>
          <p>You must be a Verifier to access this page.</p>
        </div>
      )}
    </div>
  );
}