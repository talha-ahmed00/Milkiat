import Navbar from "./Navbar";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS, pinFileToIPFS } from "../pinata";
import Marketplace from "../Marketplace.json";
import { useLocation } from "react-router";

export default function SellNFT() {
  const [formParams, updateFormParams] = useState({
    name: "",
    address: "",
    price: "",
    typeofhouse: "",
    squareyards: "",
    bedrooms: "",
    yearbuilt: "",
  });
  const [fileURL, setFileURL] = useState(null);
  const ethers = require("ethers");
  const [message, updateMessage] = useState("");
  const location = useLocation();

  async function OnChangeFile(e) {
    var file = e.target.files[0];
    //check for file extension
    try {
      //upload the file to IPFS
      const response = await uploadFileToIPFS(file);
      if (response.success === true) {
        console.log("Uploaded image to Pinata: ", response.pinataURL);
        setFileURL(response.pinataURL);
      }
    } catch (e) {
      console.log("Error during file upload", e);
    }
  }

  async function uploadMetadataToIPFS() {
    const {
      name,
      address,
      price,
      typeofhouse,
      squareyards,
      bedrooms,
      yearbuilt,
    } = formParams;
    //Make sure that none of the fields are empty
    if (
      !name ||
      !address ||
      !price ||
      !typeofhouse ||
      !squareyards ||
      !bedrooms ||
      !yearbuilt ||
      !fileURL
    )
      return;

    const nftJSON = {
      name: name,
      address: address,
      price: price,
      typeofhouse: typeofhouse,
      squareyards: squareyards,
      bedrooms: bedrooms,
      yearbuilt: yearbuilt,
      image: fileURL,
    };

    try {
      //upload the metadata JSON to IPFS
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        console.log("Uploaded JSON to Pinata: ", response);
        return response.pinataURL;
      }
    } catch (e) {
      console.log("error uploading JSON metadata:", e);
    }
  }

  async function listNFT(e) {
    e.preventDefault();

    //Upload data to IPFS
    try {
      updateMessage("Uploading metadata to IPFS...");
      const metadataURL = await uploadMetadataToIPFS();
      //After adding your Hardhat network to your metamask, this code will get providers and signers
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      updateMessage("Connecting to the Marketplace contract...");

      //Pull the deployed contract instance
      let contract = new ethers.Contract(
        Marketplace.address,
        Marketplace.abi,
        signer
      );
      updateMessage("Please wait...Creating Property Token (upto 20 seconds)");
      //massage the params to be sent to the create NFT request
      const price = ethers.utils.parseUnits(formParams.price, "ether");
    
      let listingPrice = await contract.getListPrice();
      listingPrice = listingPrice.toString();
      console.log(listingPrice);
      console.log(metadataURL);
      //actually create the NFT
      let transaction = await contract.createToken(metadataURL, price, {
        value: listingPrice,
      });
      await transaction.wait();
      updateMessage("Successfully listed your Property!");
      updateFormParams({
        name: "",
        address: "",
        price: "",
        typeofhouse: "",
        squareyards: "",
        bedrooms: "",
        yearbuilt: "",
      });
      setTimeout(() => {
        window.location.replace("/marketplace");
      }, 5000); // Wait for 3 seconds before redirecting
    } catch (e) {
      alert("Upload error" + e);
    }
  }

  return (
    <div className="">
      <Navbar></Navbar>
      <div className="flex flex-col  place-items-center mt-10" id="nftForm ">
        <form className="bg-white h-[80vh] overflow-scroll shadow-md rounded px-8 pt-4 pb-8 mb-4">
          <h3 className="text-center font-bold  mb-8">List Your Property</h3>
          <div className="mb-4">
            <label className="block   text-sm font-bold mb-2" htmlFor="name">
              House Number
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="e.g. House# A35"
              onChange={(e) =>
                updateFormParams({ ...formParams, name: e.target.value })
              }
              value={formParams.name}
            ></input>
          </div>
          <div className="mb-6">
            <label
              className="block   text-sm font-bold mb-2"
              htmlFor="description"
            >
              Property Address
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              cols="40"
              rows="5"
              id="address"
              type="text"
              placeholder="e.g. IBA Karachi"
              value={formParams.description}
              onChange={(e) =>
                updateFormParams({ ...formParams, address: e.target.value })
              }
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block   text-sm font-bold mb-2" htmlFor="name">
              Type of Residence
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="typeofhouse"
              type="text"
              placeholder="e.g. Apatment, Bungalow etc."
              onChange={(e) =>
                updateFormParams({ ...formParams, typeofhouse: e.target.value })
              }
              value={formParams.typeofhouse}
            ></input>
          </div>
          <div className="mb-4">
            <label className="block   text-sm font-bold mb-2" htmlFor="name">
              Square Yards
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="squareyards"
              type="number"
              placeholder="e.g. 200"
              onChange={(e) =>
                updateFormParams({ ...formParams, squareyards: e.target.value })
              }
              value={formParams.squareyards}
            ></input>
          </div>
          <div className="mb-4">
            <label className="block   text-sm font-bold mb-2" htmlFor="name">
              Bedrooms
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="bedrooms"
              type="number"
              placeholder="e.g. 4"
              onChange={(e) =>
                updateFormParams({ ...formParams, bedrooms: e.target.value })
              }
              value={formParams.bedrooms}
            ></input>
          </div>
          <div className="mb-4">
            <label className="block   text-sm font-bold mb-2" htmlFor="name">
              Year Built
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="yearbuilt"
              type="number"
              placeholder="e.g. 2023"
              onChange={(e) =>
                updateFormParams({ ...formParams, yearbuilt: e.target.value })
              }
              value={formParams.yearbuilt}
            ></input>
          </div>
          <div className="mb-6">
            <label className="block   text-sm font-bold mb-2" htmlFor="price">
              Price (in ETH)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              placeholder="Min 0.01 ETH"
              step="0.01"
              value={formParams.price}
              onChange={(e) =>
                updateFormParams({ ...formParams, price: e.target.value })
              }
            ></input>
          </div>
          <div>
            <label className="block   text-sm font-bold mb-2" htmlFor="image">
              Upload Image
            </label>
            <input type={"file"} onChange={OnChangeFile}></input>
          </div>
          <br></br>
          <div className="text-green text-center">{message}</div>
          <button
            onClick={listNFT}
            className="font-bold mt-10 w-full bg-[#00358e] text-white rounded p-2 shadow-lg"
          >
            Register Property
          </button>
        </form>
      </div>
    </div>
  );
}
