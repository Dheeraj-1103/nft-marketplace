// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketplace is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    uint256 private listingPrice = 0.025 ether;

    // Uniqueness checks
    mapping(string => bool) private _tokenURIExists;
    mapping(string => bool) private _imageURIExists;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed owner,
        uint256 price,
        bool sold
    );

    event ListingPriceUpdated(uint256 newPrice);
    event Withdraw(address indexed owner, uint256 amount);

    constructor() ERC721("Metaverse Tokens", "METT") {}

    function getListingPrice() external view returns (uint256) {
        return listingPrice;
    }

    function updateListingPrice(uint256 _listingPrice) external onlyOwner {
        listingPrice = _listingPrice;
        emit ListingPriceUpdated(_listingPrice);
    }

    function isContentOwned(string memory imageURI) external view returns (bool) {
        return _imageURIExists[imageURI];
    }

    // Mint NFT and create market item
    function createToken(
        string memory tokenURI,
        string memory imageURI,
        uint256 price
    ) external payable returns (uint256) {
        require(!_imageURIExists[imageURI], "NFT with this image already exists!");
        require(price > 0, "Price must be greater than zero");
        require(msg.value == listingPrice, "Must pay listing price");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        _tokenURIExists[tokenURI] = true;
        _imageURIExists[imageURI] = true;

        _createMarketItem(newTokenId, price);

        return newTokenId;
    }

    function _createMarketItem(uint256 tokenId, uint256 price) private {
        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId);

        emit MarketItemCreated(tokenId, msg.sender, address(this), price, false);
    }

    function resellToken(uint256 tokenId, uint256 price) external payable {
        MarketItem storage item = idToMarketItem[tokenId];
        require(item.owner == msg.sender, "Only item owner can resell");
        require(msg.value == listingPrice, "Must pay listing price");
        require(price > 0, "Price must be greater than zero");

        item.sold = false;
        item.price = price;
        item.seller = payable(msg.sender);
        item.owner = payable(address(this));

        _itemsSold.decrement();
        _transfer(msg.sender, address(this), tokenId);
    }

    function createMarketSale(uint256 tokenId) external payable {
        MarketItem storage item = idToMarketItem[tokenId];
        uint256 price = item.price;
        address payable seller = item.seller;

        require(msg.value == price, "Please submit asking price");

        item.owner = payable(msg.sender);
        item.sold = true;
        item.seller = payable(address(0));

        _itemsSold.increment();

        _transfer(address(this), msg.sender, tokenId);

        payable(owner()).transfer(listingPrice);
        payable(seller).transfer(msg.value);
    }

    function fetchMarketItems() external view returns (MarketItem[] memory) {
        uint256 itemCount = _tokenIds.current();
        uint256 unsoldItemCount = itemCount - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 1; i <= itemCount; i++) {
            if (idToMarketItem[i].owner == address(this)) {
                items[currentIndex] = idToMarketItem[i];
                currentIndex++;
            }
        }
        return items;
    }

    function fetchMyNFTs() external view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToMarketItem[i].owner == msg.sender) {
                itemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToMarketItem[i].owner == msg.sender) {
                items[currentIndex] = idToMarketItem[i];
                currentIndex++;
            }
        }
        return items;
    }

    function fetchItemsListed() external view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToMarketItem[i].seller == msg.sender) {
                itemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToMarketItem[i].seller == msg.sender) {
                items[currentIndex] = idToMarketItem[i];
                currentIndex++;
            }
        }
        return items;
    }

    // Owner can withdraw collected listing fees
    function withdraw() external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "No balance to withdraw");
        payable(owner()).transfer(amount);
        emit Withdraw(owner(), amount);
    }

    // Fallback & receive to accept ETH
    receive() external payable {}
    fallback() external payable {}
}
