//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract NFTMarketplace is ERC721URIStorage{

    address payable public owner;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    uint256 listPrice = 0.01 ether;
    uint256 listPriceinWei = 10**16 wei;

    
    constructor() ERC721("NFTMarketplaces", "NFTMK") {
        owner = payable(msg.sender);
    }

    address[] public verifiers;
    mapping(address => bool) public isVerifier;
    mapping(uint256 => ListedToken) private idToListedToken;

    struct ListedToken{

        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed;
        bool isVerified;
        address payable verifier;
    }

    event TokenCreatedSuccess (
        uint256 indexed tokenId,
        address owner,
        address seller,
        uint256 price,
        bool currentlyListed,
        bool isVerified,
        address payable verifier
    
    );

    event TokenListedSuccess (
        uint256 indexed tokenId,
        address owner,
        address seller,
        uint256 price,
        bool currentlyListed,
        bool isVerified,
        address payable verifier
    );


    modifier onlyVerifier() {
        require(isVerifier[msg.sender], "Caller is not a verifier");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the admin");
        _;
    }

    

    function addVerifier(address _verifier) public onlyOwner {
        isVerifier[_verifier] = true;
        verifiers.push(_verifier);
    }

    function removeVerifier(address _verifier) public onlyOwner {
        isVerifier[_verifier] = false;
        for (uint256 i = 0; i < verifiers.length; i++) {
            if (verifiers[i] == _verifier) {
                verifiers[i] = verifiers[verifiers.length - 1];
                verifiers.pop();
                break;
            }
        }
    }
    function getVerifiers() public view returns (address[] memory) {
    return verifiers;
}

    function updateListPrice(uint256 _listPrice) public payable {
        require(owner == msg.sender, "Only owner can update listing price");
        listPrice = _listPrice;
    }

    function getListPrice() public view returns (uint256) {
        return listPrice;
    }

    function getLatestIdToListedToken() public view returns (ListedToken memory) {
        uint256 currentTokenId = _tokenIds.current();
        return idToListedToken[currentTokenId];
    }

    function getListedTokenForId(uint256 tokenId) public view returns (ListedToken memory) {
        return idToListedToken[tokenId];
    }

    function getCurrentToken() public view returns (uint256) {
        return _tokenIds.current();
    }

    function createToken(string memory tokenURI, uint256 price) public payable returns (uint) {

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);

        _setTokenURI(newTokenId, tokenURI);

        createListedToken(newTokenId, price);

        return newTokenId;
    }

    function createListedToken(uint256 tokenId, uint256 price) private {
        require(price >= listPrice, "Hopefully sending the correct price");
        require(price > 0, "Make sure the price isn't negative");

        idToListedToken[tokenId] = ListedToken(
            tokenId,
            payable(address(this)),
            payable(msg.sender),
            price,
            false,
            false,
            payable(address(0))
        );

        _transfer(msg.sender, address(this), tokenId);
        emit TokenCreatedSuccess(
            tokenId,
            address(this),
            msg.sender,
            price,
            false,
            false,
            payable(address(0))
        );
    }

        function verifyToken(uint256 tokenId, bool _isVerified) public onlyVerifier {
        idToListedToken[tokenId].isVerified = _isVerified;
        if (_isVerified) {
            idToListedToken[tokenId].currentlyListed = true;
             idToListedToken[tokenId].verifier = payable(msg.sender);
            emit TokenListedSuccess(
                tokenId,
                address(this),
                idToListedToken[tokenId].seller,
                idToListedToken[tokenId].price,
                true,
                true,
                payable(msg.sender)
            );
        } 
        
        else {
            idToListedToken[tokenId].currentlyListed = false;
        }
    }

            function getAllListedNFTs() public view returns (ListedToken[] memory) {
        uint nftCount = _tokenIds.current();
        uint listedCount = 0;
        uint currentIndex = 0;
        uint currentId;

        for (uint i = 0; i < nftCount; i++) {
            if (idToListedToken[i + 1].currentlyListed) {
                listedCount++;
            }
        }

        ListedToken[] memory tokens = new ListedToken[](listedCount);

        for(uint i = 0; i < nftCount; i++) {
            currentId = i + 1;
            if (idToListedToken[currentId].currentlyListed) {
                tokens[currentIndex] = idToListedToken[currentId];
                currentIndex += 1;
            }
        }
        return tokens;
    }

    function getAllNFTs() public view returns (ListedToken[] memory) {
        uint nftCount = _tokenIds.current();
        ListedToken[] memory tokens = new ListedToken[](nftCount);
        uint currentIndex = 0;
        uint currentId;

        for(uint i = 0; i < nftCount; i++) {
            currentId = i + 1;
            tokens[currentIndex] = idToListedToken[currentId];
            currentIndex += 1;
        }
        return tokens;
    }



        function getMyNFTs() public view returns (ListedToken[] memory) {
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;
        uint currentId;

        // Count all NFTs belonging to the user (both verified and unverified)
        for(uint i = 0; i < totalItemCount; i++) {
            if(idToListedToken[i + 1].owner == msg.sender || idToListedToken[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        // Create an array to store all NFTs belonging to the user
        ListedToken[] memory items = new ListedToken[](itemCount);

        for(uint i = 0; i < totalItemCount; i++) {
            if(idToListedToken[i + 1].owner == msg.sender || idToListedToken[i + 1].seller == msg.sender) {
                currentId = i + 1;
                ListedToken storage currentItem = idToListedToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }



        function getAllUnverifiedNFTs() public view returns (ListedToken[] memory) {
    uint nftCount = _tokenIds.current();
    uint unverifiedCount = 0;

    // Count unverified NFTs
    for (uint i = 0; i < nftCount; i++) {
        if (!idToListedToken[i + 1].isVerified) {
            unverifiedCount++;
        }
    }

    ListedToken[] memory unverifiedTokens = new ListedToken[](unverifiedCount);
    uint currentIndex = 0;
    uint currentId;

    // Store unverified NFTs in the unverifiedTokens array
    for (uint i = 0; i < nftCount; i++) {
        currentId = i + 1;
        if (!idToListedToken[currentId].isVerified) {
            ListedToken storage currentItem = idToListedToken[currentId];
            unverifiedTokens[currentIndex] = currentItem;
            currentIndex += 1;
        }
    }

    return unverifiedTokens;
}




    function executeSale(uint256 tokenId) public payable {
    require(_exists(tokenId), "Token does not exist");
    uint price = idToListedToken[tokenId].price;
    address seller = idToListedToken[tokenId].seller;
    require(idToListedToken[tokenId].isVerified == true, "Token must be verified before purchase");
    require(idToListedToken[tokenId].currentlyListed == true, "Token must be listed for sale");
    require(msg.value >= price, "Please submit the asking price in order to complete the purchase");

    idToListedToken[tokenId].currentlyListed = false;
    idToListedToken[tokenId].seller = payable(msg.sender);
    _itemsSold.increment();

    _transfer(address(this), msg.sender, tokenId);
    //approve the marketplace to sell NFTs on your behalf
    approve(address(this), tokenId);

    // Calculate the share for the platform and the verifier
    uint256 platformShare = (listPriceinWei * 70) / 100;
    uint256 verifierShare = (listPriceinWei * 30) / 100;

    // Find the verifier for this tokenId
    address verifier = idToListedToken[tokenId].verifier;

    //Transfer the listing fee to the marketplace creator
    payable(owner).transfer(platformShare/1e18);
    //Transfer the verifier's share
    payable(verifier).transfer(verifierShare/1e18);
    //Transfer the proceeds from the sale to the seller of the NFT
    payable(seller).transfer(msg.value - listPrice);
}


    function resellToken(uint256 tokenId, uint256 price) public payable {
      require(idToListedToken[tokenId].seller == msg.sender, "Only item owner can perform this operation");
      require(!idToListedToken[tokenId].currentlyListed, "Token is already listed for sale");
      require(price >= listPrice, "Price must be equal to listing price");
      idToListedToken[tokenId].currentlyListed = true;
      idToListedToken[tokenId].price = price;
      idToListedToken[tokenId].seller = payable(msg.sender);
      idToListedToken[tokenId].owner = payable(address(this));
      _itemsSold.decrement();

      _transfer(msg.sender, address(this), tokenId);
    }




}