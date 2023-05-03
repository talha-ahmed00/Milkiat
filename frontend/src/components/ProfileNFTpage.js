import Navbar from "./Navbar";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";

export default function ProfileNFTPage(props) {
  const [data, updateData] = useState({});
  const [dataFetched, updateDataFetched] = useState(false);
  const [message, updateMessage] = useState("");
  const [currAddress, updateCurrAddress] = useState("0x");
  const [inputPrice, setInputPrice] = useState("0.01");
  const [transactionMessage, setTransactionMessage] = useState("");


  async function getNFTData(tokenId) {
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)

    const listedToken = await contract.getListedTokenForId(tokenId);
    let tokenURI = await contract.tokenURI(tokenId);
    let meta = await axios.get(tokenURI.replace('https://gateway.pinata.cloud/ipfs', 'https://ipfs.io/ipfs'));
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
      isVerified: listedToken.isVerified,
      currentlyListed: listedToken.currentlyListed,
    }

    updateData(item);
    updateDataFetched(true);
    updateCurrAddress(addr);
  }

  async function resellNFT(tokenId, price) {
    try {
      const ethers = require("ethers");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
  
      const salePrice = ethers.utils.parseUnits(price.toString(), 'ether'); // Convert price to string here
      setTransactionMessage("Listing the Property... Please Wait (Upto 20 seconds)");

    let transaction = await contract.resellToken(tokenId, salePrice);
    await transaction.wait();

    setTransactionMessage("You successfully listed the Property for sale!");
    setTimeout(() => {
      window.location.replace("/marketplace");
    }, 5000); // Wait for 3 seconds before redirecting
  } catch (e) {
    setTransactionMessage("Error: " + e);
  }
  }

  const handlePriceInput = (e) => {
    const value = e.target.value === "" ? "" : parseFloat(e.target.value);
    setInputPrice(value);
  };

  const handleResellButtonClick = () => {
    resellNFT(data.tokenId, inputPrice);
  };

  const renderActionButton = () => {
    if (currAddress === data.seller && !data.isVerified) {
      return <div className="text-red-600">This property is not Verified</div>;
    } else if (currAddress === data.seller && !data.currentlyListed) {
      return (
        <div>
          <input
            type="number"
            step="0.01"
            className="border-2 p-2 rounded-lg text-black" // Add "text-black" class here
            placeholder="Price in ETH (min 0.1)"
            value={inputPrice}
            onChange={handlePriceInput}
          />

          <button
            className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm ml-4"
            onClick={handleResellButtonClick} // use handleResellButtonClick here
          >
            Resell Property
          </button>
        </div>
      );
    } else {
      return (
        <div className="text-yellow-300">This property is listed for sale</div>
      );
    }
  };

  const params = useParams();
  const tokenId = params.tokenId;

  useEffect(() => {
    if (!dataFetched) {
      getNFTData(tokenId);
    }
  }, [dataFetched, tokenId]);

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
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
            {renderActionButton()}
            <div className="text-yellow-300 text-center mt-3">{message}</div>
            <div className="mt-3">
      {transactionMessage && (
        <div className="p-4 rounded shadow-md">
          <span
            className={`font-semibold ${
              transactionMessage.startsWith("You successfully")
                ? "text-green-500"
                : transactionMessage.startsWith("Listing the Property")
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
    </div>
  );
}
