const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const fs = require("fs");

async function main() {
  
    
    const Marketplace = await ethers.getContractFactory("NFTMarketplace");
  
    const deployedMarketplace = await Marketplace.deploy();
  
   
    console.log(
      "Marketplace deployed to address",
      deployedMarketplace.address
    );
    const data = {
      address: deployedMarketplace.address,
      abi: JSON.parse(deployedMarketplace.interface.format('json'))
    }

    fs.writeFileSync('./Malkiat/hardhat/Marketplace.json', JSON.stringify(data))
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });