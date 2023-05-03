import React from "react";
import {
    BrowserRouter as Router,
    Link,
  } from "react-router-dom";

function UnverifiedNFTTile({ data, onVerify }) {
    const newTo = {
        pathname: "/unverified-nft-page/" + data.tokenId,
      };
    
      
    
  return (
    <Link to={newTo}>
    <div
        className="border-2 ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-2xl"
      >
        <img
          src={data.image}
          alt=""
          className="w-72 h-80 rounded-lg object-cover"
        />
        <div className="text-white w-full p-2 bg-gradient-to-t from-[#454545] to-transparent rounded-lg pt-5 -mt-20">
          <strong className="text-xl">{data.name}</strong>
          <p className="display-inline">{data.price + " ETH"}</p>
        </div>
      </div>
    </Link>
  );
}

export default UnverifiedNFTTile;
