import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";

export default function Marketplace() {
const sampleData = [
    {
        "name": "C-30",
        "address": "Defence Phase 8",
        "image":"https://gateway.pinata.cloud/ipfs/QmaFJpszj7nRojAa4Dh4gzSpC4CzTpsGZ7a3LgJii9HVbq",
        "typeofhouse": "Bungalow",
        "bedrooms": "5",
        "sqaureyards": "1000",
        "yearbuilt": "2015",
        "price":"0.06ETH",
        "currentlySelling":"True",
        "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
    },
    {
        "name": "B-12",
        "address": "Gulshan Block 6",
        "image":"https://gateway.pinata.cloud/ipfs/QmaFJpszj7nRojAa4Dh4gzSpC4CzTpsGZ7a3LgJii9HVbq",
        "typeofhouse": "Bungalow",
        "bedrooms": "5",
        "sqaureyards": "500",
        "yearbuilt": "2010",
        "price":"0.03ETH",
        "currentlySelling":"True",
        "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
    },
    {
        "name": "A-72",
        "address": "Gulshan Block 4",
        "image":"https://gateway.pinata.cloud/ipfs/QmaFJpszj7nRojAa4Dh4gzSpC4CzTpsGZ7a3LgJii9HVbq",
        "typeofhouse": "Apartment",
        "bedrooms": "3",
        "sqaureyards": "200",
        "yearbuilt": "2012",
        "price":"0.01ETH",
        "currentlySelling":"True",
        "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
    },
];
const [data, updateData] = useState(sampleData);
const [dataFetched, updateFetched] = useState(false);

async function getAllNFTs() {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    //Pull the deployed contract instance
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
    //create an NFT Token
    let transaction = await contract.getAllNFTs()

    //Fetch all the details of every NFT from the contract and display
    const items = await Promise.all(transaction.map(async i => {
        const tokenURI = await contract.tokenURI(i.tokenId);
        let meta = await axios.get(tokenURI);
        meta = meta.data;

        let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
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
        }
        return item;
    }))

    updateFetched(true);
    updateData(items);
}

if(!dataFetched)
    getAllNFTs();
return (
    <div>
        <Navbar></Navbar>
        <div className="flex flex-col place-items-center mt-20">
            <div className="md:text-xl font-bold text-white">
                Property On Sale!
            </div>
            <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
                {data.map((value, index) => {
                    return <NFTTile data={value} key={index}></NFTTile>;
                })}
            </div>
        </div>            
    </div>
);

}