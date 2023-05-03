const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace", function () {
  let NFTMarketplace, nftMarketplace, owner, addr1, addr2, addr3;

  beforeEach(async () => {
    NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
    nftMarketplace = await NFTMarketplace.deploy();
  });

  it("Should mint and list a new token with proper initial values", async function () {
    const tokenURI = "https://ipfs.io/ipfs/QmSKhCbwzBsx9rCHy2X74aW3ApLjLDPhaRWezyVDmWQCfC";
    const price = ethers.utils.parseEther("1");

    await nftMarketplace.connect(addr1).createToken(tokenURI, price);

    const listedToken = await nftMarketplace.getListedTokenForId(1);

    expect(listedToken.owner).to.equal(nftMarketplace.address);
    expect(listedToken.seller).to.equal(addr1.address);
    expect(listedToken.price).to.equal(price);
    expect(listedToken.currentlyListed).to.equal(false);
    expect(listedToken.isVerified).to.equal(false);
  });

  it("Should add and remove verifiers", async function () {
    await nftMarketplace.addVerifier(addr2.address);
    expect(await nftMarketplace.isVerifier(addr2.address)).to.equal(true);

    await nftMarketplace.removeVerifier(addr2.address);
    expect(await nftMarketplace.isVerifier(addr2.address)).to.equal(false);
  });

  it("Should only allow verifiers to verify a token", async function () {
    await nftMarketplace.connect(addr1).createToken("https://ipfs.io/ipfs/QmSKhCbwzBsx9rCHy2X74aW3ApLjLDPhaRWezyVDmWQCfC", ethers.utils.parseEther("1"));

    await expect(nftMarketplace.connect(addr2).verifyToken(1, true)).to.be.revertedWith("Caller is not a verifier");

    await nftMarketplace.addVerifier(addr2.address);
    await nftMarketplace.connect(addr2).verifyToken(1, true);

    const listedToken = await nftMarketplace.getListedTokenForId(1);
    expect(listedToken.isVerified).to.equal(true);
  });

  it("Should execute a sale correctly and update token information", async function () {
    const tokenURI = "https://ipfs.io/ipfs/QmSKhCbwzBsx9rCHy2X74aW3ApLjLDPhaRWezyVDmWQCfC";
    const price = ethers.utils.parseUnits('1', 'ether');
    console.log(price)
    await nftMarketplace.connect(addr1).createToken(tokenURI, price);
    console.log("Success")
    await nftMarketplace.addVerifier(addr2.address);
    console.log("Success")
    await nftMarketplace.connect(addr2).verifyToken(1, true);
    console.log("Success")
    await nftMarketplace.connect(addr3).executeSale(1, { value: ethers.utils.parseUnits('1', 'ether') });
    console.log("Success")
    const listedToken = await nftMarketplace.getListedTokenForId(1);

    expect(listedToken.owner).to.equal(nftMarketplace.address);
    expect(listedToken.seller).to.equal(addr3.address);
    expect(listedToken.price).to.equal(price);
    expect(listedToken.currentlyListed).to.equal(false);
    expect(listedToken.isVerified).to.equal(true);
 
  });

  it("Should not execute a sale when a token is unverified or not listed", async function () {
  const tokenURI = "https://ipfs.io/ipfs/QmSKhCbwzBsx9rCHy2X74aW3ApLjLDPhaRWezyVDmWQCfC";
  const price = ethers.utils.parseEther("1");
  await nftMarketplace.connect(addr1).createToken(tokenURI, price);

await expect(nftMarketplace.connect(addr3).executeSale(1, { value: price })).to.be.revertedWith("Token must be verified before purchase");

await nftMarketplace.addVerifier(addr2.address);
await nftMarketplace.connect(addr2).verifyToken(1, true);

await expect(nftMarketplace.connect(addr3).executeSale(1, { value: price })).to.be.revertedWith("Token must be listed for sale");


});

it("Should resell a token correctly and update token information", async function () {
  const tokenURI = "https://ipfs.io/ipfs/QmSKhCbwzBsx9rCHy2X74aW3ApLjLDPhaRWezyVDmWQCfC";
  const price = ethers.utils.parseEther("1");
  const newPrice = ethers.utils.parseEther("1.5");
  await nftMarketplace.connect(addr1).createToken(tokenURI, price);
  await nftMarketplace.addVerifier(addr2.address);
  await nftMarketplace.connect(addr2).verifyToken(1, true);

  await nftMarketplace.connect(addr3).executeSale(1, { value: price });

  await nftMarketplace.connect(addr3).resellToken(1, newPrice);

  const listedToken = await nftMarketplace.getListedTokenForId(1);

  expect(listedToken.owner).to.equal(nftMarketplace.address);
  expect(listedToken.seller).to.equal(addr3.address);
  expect(listedToken.price).to.equal(newPrice);
  expect(listedToken.currentlyListed).to.equal(true);
});

it("Should not resell a token when the caller is not the owner", async function () {
const tokenURI = "https://ipfs.io/ipfs/QmSKhCbwzBsx9rCHy2X74aW3ApLjLDPhaRWezyVDmWQCfC";
const price = ethers.utils.parseEther("1");
await nftMarketplace.connect(addr1).createToken(tokenURI, price);
await nftMarketplace.addVerifier(addr2.address);
await nftMarketplace.connect(addr2).verifyToken(1, true);

await nftMarketplace.connect(addr3).executeSale(1, { value: price });

await expect(nftMarketplace.connect(addr1).resellToken(1, ethers.utils.parseEther("1.5"))).to.be.revertedWith("Only item owner can perform this operation");
});

});
  