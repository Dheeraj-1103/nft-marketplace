const { ethers } = require("hardhat");

describe("NFTMarket", function() {
  it("Should create and execute market sales", async function() {
    // Deploy the NFTMarketplace contract
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    const nftMarketplace = await NFTMarketplace.deploy();
    await nftMarketplace.deployed();

    // Get listing price (in wei)
    let listingPrice = await nftMarketplace.getListingPrice();
    listingPrice = listingPrice.toString();

    // Auction price for NFTs (1 ether)
    const auctionPrice = ethers.utils.parseUnits('1', 'ether');

    // Create two tokens with tokenURI, imageURI, and price
    await nftMarketplace.createToken(
      "https://www.mytokenlocation.com",
      "https://www.mytokenimage.com/image1.png",
      auctionPrice,
      { value: listingPrice }
    );

    await nftMarketplace.createToken(
      "https://www.mytokenlocation2.com",
      "https://www.mytokenimage.com/image2.png",
      auctionPrice,
      { value: listingPrice }
    );

    // Get accounts, use buyer for purchases
    const [_, buyerAddress] = await ethers.getSigners();

    // Execute sale of token #1 to buyerAddress, paying auctionPrice
    await nftMarketplace.connect(buyerAddress).createMarketSale(1, { value: auctionPrice });

    // Resell the token #1 by buyerAddress, paying listing price
    await nftMarketplace.connect(buyerAddress).resellToken(1, auctionPrice, { value: listingPrice });

    // Fetch unsold items
    let items = await nftMarketplace.fetchMarketItems();
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nftMarketplace.tokenURI(i.tokenId);
      return {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      };
    }));

    console.log('items: ', items);
  });
});
