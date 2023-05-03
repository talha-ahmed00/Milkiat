import Navbar from "./Navbar";
import Marketplace from "../Marketplace.json";
import React, { useState, useEffect } from "react";

export default function AddVerifier() {
  const [verifierAddress, setVerifierAddress] = useState("");
  const [message, setMessage] = useState("");
  const ethers = require("ethers");
  const [isOwner, setIsOwner] = useState(false);
  const [verifiers, setVerifiers] = useState([]);

  useEffect(() => {
    const checkOwnership = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(
        Marketplace.address,
        Marketplace.abi,
        provider
      );
      const ownerAddress = await contract.owner();
      setIsOwner(userAddress.toLowerCase() === ownerAddress.toLowerCase());
      const fetchedVerifiers = await contract.getVerifiers();
      setVerifiers(fetchedVerifiers);
    };
    checkOwnership();
  }, []);

  async function addVerifier(e) {
    e.preventDefault();

    if (!verifierAddress) {
      alert("Please enter a valid wallet address.");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      setMessage("Please wait.. adding verifier");

      let contract = new ethers.Contract(
        Marketplace.address,
        Marketplace.abi,
        signer
      );

      let transaction = await contract.addVerifier(verifierAddress);
      await transaction.wait();
      setMessage("");
      alert("Verifier added successfully!");
      setVerifierAddress("");
      window.location.reload();
    } catch (e) {
      alert("Error adding verifier: " + e);
    }
  }

  async function removeVerifier(verifier) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      setMessage("Please wait.. removing verifier");

      let contract = new ethers.Contract(
        Marketplace.address,
        Marketplace.abi,
        signer
      );

      let transaction = await contract.removeVerifier(verifier);
      await transaction.wait();
      setMessage("");
      alert("Verifier removed successfully!");
      window.location.reload();
    } catch (e) {
      alert("Error removing verifier: " + e);
    }
  }

  const renderVerifiers = () => {
    return verifiers.map((verifier, index) => (
      <div key={index} className="flex items-center justify-between mb-2">
        <span className="text-sm">{verifier}</span>
        <button
          className="text-red-500 font-bold"
          onClick={() => removeVerifier(verifier)}
        >
          Remove
        </button>
      </div>
    ));
  };

  return (
    <div className="">
      <Navbar></Navbar>
      {isOwner ? (
        <div className="flex flex-col place-items-center mt-10">
          <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="verifierAddress"
              >
                Add Verifier Address
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="verifierAddress"
                type="text"
                value={verifierAddress}
                onChange={(e) => setVerifierAddress(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={addVerifier}
              >
                Add Verifier
              </button>
            </div>
            {message && (
              <p className="text-red-500 text-xs italic mt-2">{message}</p>
            )}
          </form>
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full">
            <h2 className="text-gray-700 text-lg font-bold mb-4">
              Current Verifiers
            </h2>
            {renderVerifiers()}
          </div>
        </div>
      ) : (
        <div className="mt-10 flex justify-center">
          <h2 className="text-red-500 font-bold">
            You are not authorized to add/remove verifiers.
          </h2>
        </div>
      )}
    </div>
  );
}