import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { DisplayCampaigns, Loader } from "../components";
import { useStateContext } from "../context";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]); // User-created campaigns
  const [donations, setDonations] = useState([]); // Donations made by the user
  const [balance, setBalance] = useState("0"); // Account balance

  const { address, contract, getCampaigns, getUserDonationHistory } =
    useStateContext();

  // Fetch account balance
  const fetchBalance = async () => {
    if (!address) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balanceWei = await provider.getBalance(address);
      setBalance(ethers.utils.formatEther(balanceWei));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  // Fetch user-created campaigns
  const fetchUserCampaigns = async () => {
    if (!contract) return;
    try {
      setIsLoading(true);
      const allCampaigns = await getCampaigns();
      const userCampaigns = allCampaigns.filter(
        (campaign) => campaign.owner.toLowerCase() === address.toLowerCase()
      );
      setCampaigns(userCampaigns);
    } catch (error) {
      console.error("Error fetching user campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user donations
  const fetchDonations = async () => {
    if (!contract) return;
    try {
      setIsLoading(true);
      const donationsData = await getUserDonationHistory();
      setDonations(donationsData);
    } catch (error) {
      console.error("Error fetching donation history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchBalance();
      fetchUserCampaigns();
      fetchDonations();
    }
  }, [address, contract]);

  return (
    <div>
      {isLoading && <Loader />}

      {/* User Info Section */}
      <div className="flex flex-col items-center bg-[#1c1c24] p-6 rounded-lg shadow-lg text-white">
        <h2 className="font-epilogue font-semibold text-[24px]">My Profile</h2>
        <p className="mt-2 text-[#808191] break-all">{address}</p>
        <p className="mt-2 text-lg font-semibold">
          Account Balance: <span className="text-[#4acd8d]">{balance} ETH</span>
        </p>
      </div>

      {/* User-Created Campaigns */}
      <div className="mt-10">
        <DisplayCampaigns
          title="My Campaigns"
          isLoading={isLoading}
          campaigns={campaigns}
        />
      </div>

      {/* Donations Made by the User */}
      <div className="mt-10">
        <h3 className="font-epilogue font-semibold text-[20px] text-white">
          My Donations
        </h3>
        <div className="mt-4 bg-[#1c1c24] p-4 rounded-lg shadow-lg">
          {donations.length > 0 ? (
            donations.map((donation, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b border-[#2c2f32]"
              >
                <p className="text-[#b2b3bd]">
                  {index + 1}. {donation.title}
                </p>
                <p className="text-[#4acd8d]">
                 {donation.amount} ETH
                </p>
              </div>
            ))
          ) : (
            <p className="text-[#808191]">No donations made yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
