import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import Marketplace from "../Marketplace.json";
import { ethers } from "ethers";
import logo from '../milkiat_logo.png';

function Navbar() {
  const [connected, toggleConnect] = useState(false);
  const location = useLocation();
  const [currAddress, updateAddress] = useState("0x");
  const [isVerifier, setIsVerifier] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const isMetaMaskInstalled = typeof window.ethereum !== 'undefined';
  const nftMarketplaceAddress = Marketplace.address; 

  async function isWalletConnectedToWebsite() {
    if (isMetaMaskInstalled) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0;
    }
    return false;
  }


  async function checkVerifierStatus() {
    if (isMetaMaskInstalled) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const nftMarketplace = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
      const verifierStatus = await nftMarketplace.isVerifier(currAddress);
      setIsVerifier(verifierStatus);
    }
  }
  
  async function checkOwnerStatus() {
    if (isMetaMaskInstalled) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const nftMarketplace = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
      const ownerStatus = await nftMarketplace.owner();
      setIsOwner(ownerStatus === currAddress);
    }
  }
  
  async function getAddress() {
    if (isMetaMaskInstalled) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const addr = await signer.getAddress();
      updateAddress(addr);
    }
  }
  
  function updateButton() {
    const ethereumButton = document.querySelector(".enableEthereumButton");
    ethereumButton.textContent = "Connected";
    ethereumButton.classList.remove("hover:bg-blue-700");
    ethereumButton.classList.remove("bg-blue-500");
    ethereumButton.classList.add("hover:bg-blue-600");
    ethereumButton.classList.add("bg-blue-400");
  }

  async function connectWebsite() {
    if (isMetaMaskInstalled) {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      await window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then(async () => {
          updateButton();
          await getAddress();
        });
    }
  }
  
  useEffect(() => {
    (async () => {
      const isConnected = await isWalletConnectedToWebsite();
      toggleConnect(isConnected);
    })();
    if (isMetaMaskInstalled) {
      let val = window.ethereum.isConnected();
      if (val) {
        getAddress();
        toggleConnect(val);
        updateButton();
      }
  
      window.ethereum.on("accountsChanged", function (accounts) {
        getAddress();
      });
    }
  }, []);
  
  useEffect(() => {
    if (currAddress && currAddress !== "0x") {
      (async () => {
        await checkVerifierStatus();
        await checkOwnerStatus();
      })();
    }
  }, [currAddress]);

  if (!isMetaMaskInstalled) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col">
          <div className="mb-4">
            <span className="block text-grey-darker text-lg text-center font-bold mb-2">Metamask is not installed</span>
            <p className="text-center">Please install Metamask in your browser to use this application.</p>
            <p className="mt-4 text-center">
            <button
            onClick={() => window.open('https://metamask.io/download/', '_blank')}
            rel="noopener noreferrer"
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
            Install Metamask
            </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <nav className="w-screen bg-white">
        <ul className="flex items-center justify-between py-2 text-black pr-5">
          <li className="flex items-center ml-5">
            <img src={logo} alt="Logo" width="50" height="50" className="mr-2" />
            <Link to="/">
              <div className="inline-block font-bold text-xl ml-2">Milkiat</div>
            </Link>
          </li>
          <li className="w-4/6">
            <ul className="lg:flex justify-end font-bold text-lg">
              {isVerifier && location.pathname === "/verifyProperty" ? (
                <li className="border-b-2 hover:pb-0 p-2">
                  <Link className="text-black hover:text-blue-600 py-1 px-3" to="/verifyProperty">
                    Verify Property
                  </Link>
                </li>
              ) : isVerifier ? (
                <li className="hover:border-b-2 hover:pb-0 p-2">
                  <Link className="text-black hover:text-blue-600 py-1 px-3" to="/verifyProperty">
                    Verify Property
                  </Link>
                </li>
              ) : null}

              {isOwner && location.pathname === "/addVerifier" ? (
                <li className="border-b-2 hover:pb-0 p-2">
                  <Link className="text-black hover:text-blue-600 py-1 px-3" to="/addVerifier">
                    Add Verifier
                  </Link>
                </li>
              ) : isOwner ? (
                <li className="hover:border-b-2 hover:pb-0 p-2">
                  <Link className="text-black hover:text-blue-600 py-1 px-3" to="/addVerifier">
                    Add Verifier
                  </Link>
                </li>
              ) : null}

              {location.pathname === "/marketplace" ? (
                <li className="border-b-2 hover:pb-0 p-2">
                  <Link className="text-black hover:text-blue-600 py-1 px-3" to="/marketplace">
                    Marketplace
                  </Link>
                </li>
              ) : (
                <li className="hover:border-b-2 hover:pb-0 p-2">
                  <Link className="text-black hover:text-blue-600 py-1 px-3" to="/marketplace">
                    Marketplace
                  </Link>
                </li>
              )}

              {location.pathname === "/sellNFT" ? (
                <li className="border-b-2 hover:pb-0 p-2">
                  <Link className="text-black hover:text-blue-600 py-1 px-3" to="/sellNFT">
                    List Property
                  </Link>
                </li>
              ) : (
                <li className="hover:border-b-2 hover:pb-0 p-2">
                  <Link className="text-black hover:text-blue-600 py-1 px-3" to="/sellNFT">
                    List Property
                  </Link>
                </li>
              )}

              {location.pathname === "/profile" ? (
                <li className="border-b-2 hover:pb-0 p-2">
                  <Link className="text-black hover:text-blue-600 py-1 px-3" to="/profile">
                    Profile
                  </Link>
                </li>
              ) : (
                <li className="hover:border-b-2 hover:pb-0             p-2">
                <Link className="text-black hover:text-blue-600 py-1 px-3" to="/profile">
                  Profile
                </Link>
              </li>
            )}
          </ul>
          </li>
          <li>
            <div className="flex flex-col items-end mr10">
              <button
                className={`enableEthereumButton font-bold py-2 px-4 rounded text-sm ${
                  connected
                    ? "bg-green-400 hover:bg-green-600 text-white"
                    : "bg-[#e2761b] hover:bg-[#cc6a16] text-white"
                }`}
                onClick={connectWebsite}
              >
                {connected ? "Connected" : "Connect Wallet"}
              </button>
              {currAddress !== "0x" ? (
                <>
                  <span className="text-xs mt-1">
                    Connected to {currAddress.substring(0, 8) + "..."}
                  </span>
                </>
              ) : (
                <span className="text-xs mt-1">Not Connected</span>
              )}
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;

