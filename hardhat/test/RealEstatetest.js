const { expect } = require('chai');
const { ethers } = require('hardhat');

const token = (n) => {

    return ethers.util.pasrseUnits(n.toString(),'ether')
}

describe("NFTMarket", function(){
    it("Should create property document", async function (){
        const Market = await ethers.getContractFactory("RealEstateMarketplace");
        const market = await Market.deploy();
        await market.deployed();
        const marketAddress = market.address;
        console.log('marketplace address', marketAddress )
        const Property = await ethers.getContractFactory("RealEstate");
        const property = await Property.deploy(marketAddress);
        await property.deployed()
        const propertyContractAddress = property.address;

        console.log('property contract address', propertyContractAddress )

        let listingPrice = await market.getListingPrice();
        listingPrice = listingPrice.toString()

        const auctionPrice = ethers.utils.parseUnits('100','ether')

        await property.createToken("https://ipfs.io/ipfs/QmRSGfQr8mJ3A151SQBLsXtKnCwZhNY2ZE7d5FXxpoyKZz")

        await market.createMarketItem(propertyContractAddress, 1, auctionPrice, {value:listingPrice})


        const[sellerAddress, buyerAddress] = await ethers.getSigners();

        
        const items = await market.fetchMarketItems()

        console.log('items: ', items[0])
    })
})

