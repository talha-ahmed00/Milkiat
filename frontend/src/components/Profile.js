import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import ProfileNFTTile from "./ProfileNFTTile";

export default function Profile () {
    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const [address, updateAddress] = useState("0x");
    const [totalPrice, updateTotalPrice] = useState("0");
    const [loading, setLoading] = useState(false);

    const params = useParams();
    const tokenId = params.tokenId;

    useEffect(() => {
      if (!dataFetched) {
        getNFTData(tokenId);
      }
    }, [dataFetched, tokenId]);

    async function getNFTData(tokenId) {
        setLoading(true);
        const ethers = require("ethers");
        let sumPrice = 0;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const addr = await signer.getAddress();

        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)

        let transaction = await contract.getMyNFTs();
        console.log("Fetched NFTs from contract:", transaction);

        const items = await Promise.all(
          transaction.map(async (i) => {
            let tokenURI = await contract.tokenURI(i[0]);
            let meta = await axios.get(
              tokenURI.replace("https://gateway.pinata.cloud/ipfs", "https://ipfs.io/ipfs")
            );
            meta = meta.data;

            let price = ethers.utils.formatUnits(i[3].toString(), "ether");
            let item = {
              price,
              tokenId: i[0].toNumber(),
              seller: i[1],
              owner: i[2],
              image: meta.image,
              name: meta.name,
              description: meta.description,
            };
            sumPrice += Number(price);
            return item;
          })
        );
        updateData(items);
        updateFetched(true);
        updateAddress(addr);
        updateTotalPrice(sumPrice.toPrecision(3));
        setLoading(false);
    }

        return (
            <div className="profileClass" style={{ minHeight: "100vh" }}>
              <Navbar></Navbar>
              {loading ? (
                <div className="flex items-center justify-center mt-20">
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
              ) : (
                <div className="profileClass">
                  <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
                    <div className="mb-5">
                      <h2 className="font-bold">Wallet Address</h2>
                      {address}
                    </div>
                  </div>
                  <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
                    <div>
                      <h2 className="font-bold">No. of Properties</h2>
                      {data.length}
                    </div>
                    <div className="ml-20">
                      <h2 className="font-bold">Total Value</h2>
                      {totalPrice} ETH
                    </div>
                  </div>
                  <div className="flex flex-col text-center items-center mt-11 text-white">
                    <h2 className="welcome-text text-white font-bold text-center mx-10">Your Properties</h2>
                    <div className="flex justify-center flex-wrap max-w-screen-xl">
                      {data.map((value, index) => {
                        return <ProfileNFTTile data={value} key={index}></ProfileNFTTile>;
                      })}
                    </div>
                    <div className="mt-10 text-xl">
                      {data.length === 0
                        ? "Oops, You don't have any property for display (Are you logged in?)"
                        : ""}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
          
}