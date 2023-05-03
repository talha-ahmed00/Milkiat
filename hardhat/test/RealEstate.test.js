const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RealEstate Marketplace", function () {
  let realEstate, owner, addr1, addr2, addr3;

  beforeEach(async () => {
    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();
    await realEstate.deployed();

    [owner, addr1, addr2, addr3] = await ethers.getSigners();
  });

  it("Should create and list a new token with proper initial values", async function () {
    await realEstate.createToken("testURI", ethers.utils.parseEther('1'));
    const listedToken = await realEstate.getListedTokenForId(1);
    
    expect(listedToken.tokenId).to.equal(1);
    expect(listedToken.owner).to.equal(realEstate.address);
    expect(listedToken.seller).to.equal(owner.address);
    expect(listedToken.price).to.equal(ethers.utils.parseUnits('1'));
    expect(listedToken.currentlyListed).to.equal(true);
  });

  it("Should execute a sale correctly and update token information", async function () {
    await realEstate.createToken("testURI", ethers.utils.parseEther('1'));
    const listedTokenBefore = await realEstate.getListedTokenForId(1);

    await realEstate.connect(addr1).executeSale(1, { value: ethers.utils.parseEther('1')});
    const listedTokenAfter = await realEstate.getListedTokenForId(1);

    expect(listedTokenAfter.tokenId).to.equal(1);
    expect(listedTokenAfter.owner).to.equal(addr1.address);
    expect(listedTokenAfter.seller).to.equal(owner.address);
    expect(listedTokenAfter.price).to.equal(ethers.utils.parseEther("1"));
    expect(listedTokenAfter.currentlyListed).to.equal(false);
  });

});
  