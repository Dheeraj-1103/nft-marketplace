import { useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";

import { marketplaceAddress } from "../config";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

// 🔒 Pinata keys loaded from environment variables
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [imageURI, setImageURI] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter();

  // 🔹 Normalize any IPFS URL to the format ipfs://CID
  function normalizeIPFS(url) {
    const match = url.match(/(?:ipfs:\/\/|https?:\/\/[^/]+\/ipfs\/)([^/?#]+)/);
    if (match && match[1]) {
      return `ipfs://${match[1]}`.toLowerCase();
    }
    return url.toLowerCase();
  }

  // 🔹 Hash file (unchanged)
  async function getFileHash(file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // 🔹 File upload (ONLY THIS CHANGED)
  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const fileHash = await getFileHash(file);
      console.log("File SHA256 Hash:", fileHash);

      const data = new FormData();
      data.append("file", file);

      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
          body: data,
        },
      );

      const result = await res.json();

      // 🔁 SAME STRUCTURE AS BEFORE
      const url = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
      setFileUrl(url);

      const normalized = normalizeIPFS(url);
      const finalURI = `hash://${fileHash}`;
      setImageURI(finalURI);
    } catch (error) {
      console.log("Error uploading file: ", error);
      alert("❌ Error uploading file to IPFS.");
    }
  }

  // 🔹 Metadata upload (ONLY THIS CHANGED)
  async function uploadToIPFS() {
    const { name, description, price } = formInput;

    if (!name || !description || !price || !fileUrl) {
      alert("Please fill all fields and upload an image.");
      return;
    }

    const data = {
      name,
      description,
      image: fileUrl, // ✅ unchanged behavior
    };

    try {
      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
          body: JSON.stringify(data),
        },
      );

      const result = await res.json();

      // 🔁 SAME STRUCTURE AS BEFORE
      const url = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
      return url;
    } catch (error) {
      console.log("Error uploading metadata: ", error);
      alert("❌ Error uploading metadata to IPFS.");
    }
  }

  // 🔹 Blockchain (UNCHANGED)
  async function listNFTForSale() {
    const tokenURI = await uploadToIPFS();
    if (!tokenURI || !imageURI) {
      alert("Upload failed or image URL missing.");
      return;
    }

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer,
    );

    const alreadyMinted = await contract.isContentOwned(imageURI);
    if (alreadyMinted) {
      alert("⚠️ NFT with this image already exists!");
      return;
    }

    const price = ethers.utils.parseUnits(formInput.price, "ether");
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    try {
      const transaction = await contract.createToken(
        tokenURI,
        imageURI,
        price,
        {
          value: listingPrice,
        },
      );
      await transaction.wait();
      alert("✅ NFT Created Successfully!");
      router.push("/");
    } catch (error) {
      console.error("Contract call failed: ", error);
      alert("❌ Failed to create NFT.");
    }
  }

  // 🔹 UI (UNCHANGED)
  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        />
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input type="file" name="Asset" className="my-4" onChange={onChange} />
        {fileUrl && <img className="rounded mt-4" width="350" src={fileUrl} />}
        <button
          onClick={listNFTForSale}
          className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg hover:bg-pink-600"
        >
          Create NFT
        </button>
      </div>
    </div>
  );
}