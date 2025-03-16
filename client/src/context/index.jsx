import React, { useContext, createContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../contractABI.js"; // Import your contract ABI

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [admin, setAdmin] = useState(null);

  // Initialize provider and contract
  useEffect(() => {
    const init = async () => {
      const ganacheProvider = new ethers.providers.JsonRpcProvider(
        "http://localhost:7545"
      );
      setProvider(ganacheProvider);

      const contractInstance = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS,
        contractABI,
        ganacheProvider
      );
      setContract(contractInstance);
      setAdmin(await contractInstance.admin());
    };
    init();
  }, []);

  useEffect(() => {
    if (contract) {
      console.log("Contract successfully set:", contract);
    }
  }, [contract]);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = web3Provider.getSigner();
        const userAddress = await signer.getAddress();

        setAddress(userAddress);

        const contractWithSigner = new ethers.Contract(
          import.meta.env.VITE_CONTRACT_ADDRESS,
          contractABI,
          signer
        );

        setContract(contractWithSigner);
        console.log("index.jsx connectWallet contract", contractWithSigner);

        return contractWithSigner; // Return the contract instance
      } else {
        alert("Please install MetaMask!");
        return null;
      }
    } catch (error) {
      console.error("Connection error:", error);
      return null;
    }
  };

  // Publish a campaign
  const createCampaign = async (form) => {
    if (!contract) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const tx = await contract.createCampaign(
        form.title,
        form.description,
        form.publicDocsCID, // IPFS CID
        form.category,
        ethers.utils.parseEther(form.goalAmount.toString()),
        Math.floor(new Date(form.deadline).getTime() / 1000)
      );

      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  };

  // Fetch all campaigns
  const getCampaigns = async () => {
    try {
      const campaigns = await contract.getCampaigns();
      return campaigns.map((campaign, i) => ({
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        publicDocsCID: campaign.publicDocsCID,
        category: campaign.category,
        goalAmount: ethers.utils.formatEther(campaign.goalAmount.toString()),
        deadline: campaign.deadline.toNumber(),
        amountRaised: ethers.utils.formatEther(
          campaign.amountRaised.toString()
        ),
        verified: campaign.verified,
        isWithdrawn: campaign.isWithdrawn,
        exists: campaign.exists,
        donorAddresses: campaign.donorAddresses,
        pId: i,
      }));
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return [];
    }
  };

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    const filteredCampaigns = allCampaigns.filter(
      (campaign) => campaign.owner === address
    );

    return filteredCampaigns;
  };

  // Donate to a campaign
  const donate = async (pId, amount, message) => {
    try {
      const transaction = await contract.donate(pId, message, {
        value: ethers.utils.parseEther(amount),
      });
      await transaction.wait();
      return { success: true, transaction };
    } catch (error) {
      console.error("Error donating:", error);
      return { success: false, error };
    }
  };

  // Fetch donations for a campaign
  const getDonations = async (pId) => {
    try {
      const [donors, amounts, messages] = await contract.getDonors(pId);
      return donors.map((donor, i) => ({
        donator: donor,
        donation: ethers.utils.formatEther(amounts[i].toString()),
        message: messages
      }));
    } catch (error) {
      console.error("Error fetching donations:", error);
      return [];
    }
  };

  // Release funds after campaign deadline
  const releaseFunds = async (pId) => {
    try {
      const tx = await contract.releaseFunds(pId);
      await tx.wait();
      return { success: true, tx };
    } catch (error) {
      console.error("Error releasing funds:", error);
      return { success: false, error };
    }
  };

  // Verify a campaign (admin only)
  const verifyCampaign = async (pId) => {
    try {
      const tx = await contract.verifyCampaign(pId);
      await tx.wait();
      return { success: true, tx };
    } catch (error) {
      console.error("Error verifying campaign:", error);
      return { success: false, error };
    }
  };

  // Refund a donation
  const refund = async (pId) => {
    try {
      const tx = await contract.refund(pId);
      await tx.wait();
      return { success: true, tx };
    } catch (error) {
      console.error("Error refunding donation:", error);
      return { success: false, error };
    }
  };

  // Delete a campaign
  const deleteCampaign = async (pId) => {
    try {
      const tx = await contract.deleteCampaign(pId);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Error deleting campaign:", error);
      throw error;
    }
  };

  // Fetch user donation history
  const getUserDonationHistory = async () => {
    try {
      const [titles, amounts] = await contract.getUserDonationHistory(address);
      return titles.map((title, i) => ({
        title,
        amount: ethers.utils.formatEther(amounts[i].toString()),
      }));
    } catch (error) {
      console.error("Error fetching donation history:", error);
      return [];
    }
  };

  // Fetch campaigns by category
  const getCampaignsByCategory = async (category) => {
    try {
      const campaigns = await contract.getCampaignsByCategory(category);
      return campaigns.map((campaign, i) => ({
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        publicDocsCID: campaign.publicDocsCID,
        category: campaign.category,
        goalAmount: ethers.utils.formatEther(campaign.goalAmount.toString()),
        deadline: campaign.deadline.toNumber(),
        amountRaised: ethers.utils.formatEther(
          campaign.amountRaised.toString()
        ),
        verified: campaign.verified,
        isWithdrawn: campaign.isWithdrawn,
        exists: campaign.exists,
        donorAddresses: campaign.donorAddresses,
        pId: i,
      }));
    } catch (error) {
      console.error("Error fetching campaigns by category:", error);
      return [];
    }
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        admin,
        connectWallet,
        createCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        releaseFunds,
        getDonations,
        verifyCampaign,
        refund,
        deleteCampaign,
        getUserDonationHistory,
        getCampaignsByCategory,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
