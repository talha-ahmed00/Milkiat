import Navbar from "./Navbar";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";

export default function NFTPage (props) {

const [data, updateData] = useState({});
const [dataFetched, updateDataFetched] = useState(false);
const [message, updateMessage] = useState("");
const [currAddress, updateCurrAddress] = useState("0x");
const [transactionMessage, setTransactionMessage] = useState("");

async function getNFTData(tokenId) {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    //Pull the deployed contract instance
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
    //create an NFT Token
    const listedToken = await contract.getListedTokenForId(tokenId);
    let tokenURI = await contract.tokenURI(tokenId);
    let meta = await axios.get(tokenURI.replace('https://gateway.pinata.cloud/ipfs', 'https://ipfs.io/ipfs'));
    meta = meta.data;
    console.log(listedToken);

    let item = {
        price: ethers.utils.formatUnits(listedToken.price, 'ether'),
        tokenId: tokenId,
        seller: listedToken.seller,
        owner: listedToken.owner,
        image: meta.image,
        name: meta.name,
        address: meta.address,
        typeofhouse: meta.typeofhouse,
        bedrooms: meta.bedrooms,
        yearbuilt: meta.yearbuilt,
        squareyards: meta.squareyards,
        verifier: listedToken.verifier,

    }
    console.log(item);
    updateData(item);
    updateDataFetched(true);
    console.log("address", addr)
    updateCurrAddress(addr);
}

async function buyNFT(tokenId) {
  try {
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
    const salePrice = ethers.utils.parseUnits(data.price, 'ether');
    setTransactionMessage("Buying the Property... Please Wait (Upto 20 seconds)");
    let transaction = await contract.executeSale(tokenId, { value: salePrice });
    await transaction.wait();
    updateMessage("You successfully bought the Property!");
    setTimeout(() => {
      window.location.replace("/marketplace");
    }, 5000); // Wait for 3 seconds before redirecting
  } catch (e) {
    setTransactionMessage("Transaction failed: " + e.message);
  }
}

    const params = useParams();
    const tokenId = params.tokenId;
    if(!dataFetched)
        getNFTData(tokenId);

        return (
          <div className="min-h-screen bg-transparent">
            <Navbar />
            <div className="container mx-auto mt-10 px-4 md:px-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="flex justify-center">
                  <img src={data.image} alt="" className="w-full h-auto rounded shadow-md max-w-lg md:max-w-xl" />
                </div>
                <div className="text-white space-y-4">
                  <h1 className="text-3xl font-bold">{data.name}</h1>
                  <p>Address: {data.address}</p>
                  <p>Type of Residence: {data.typeofhouse}</p>
                  <p>Square Yards: {data.squareyards}</p>
                  <p>Bedrooms: {data.bedrooms}</p>
                  <p>Year Built: {data.yearbuilt}</p>
                  <p>Price: <span className="text-yellow-300">{data.price + " ETH"}</span></p>
                  <p>Owner: <span className="text-sm">{data.owner}</span></p>
                  <p>Seller: <span className="text-sm">{data.seller}</span></p>
                  <p>Verifier: <span className="text-sm">{data.verifier}</span></p>
        
                  {currAddress === data.owner || currAddress === data.seller ? (
                    <div className="text-yellow-300">You are the owner of this Property</div>
                  ) : (
                    <button
                      className="w-full md:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                      onClick={() => buyNFT(tokenId)}
                    >
                      Buy this Property
                    </button>
                  )}
                  <div className="mt-3">
      {transactionMessage && (
        <div className="p-4 rounded shadow-md">
          <span
            className={`font-semibold ${
              transactionMessage.startsWith("You successfully")
                ? "text-green-500" // Change the text color to green for successful transactions
                : transactionMessage.startsWith("Buying the Property")
                ? "text-yellow-500" // Change the text color to yellow for pending transactions
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
          </div>
        );
        
        
          
        }