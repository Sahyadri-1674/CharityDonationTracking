import React, { useState, useEffect } from "react";
import { DisplayCampaigns, CustomButton } from "../components";
import { useStateContext } from "../context";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/heroImg.png";
import trust from "../assets/trust.png";
import quick from "../assets/quick.png";
import reach from "../assets/reach.png";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const { address, contract, getCampaigns } = useStateContext();
  const navigate = useNavigate();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to scroll to "All Campaigns" section
  const scrollToCampaigns = () => {
    document.getElementById("campaigns-section")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (contract) fetchCampaigns();
  }, [address, contract]);

  // Get current timestamp
  const currentTimestamp = Math.floor(Date.now() / 1000);

  // Filter campaigns
  const activeCampaigns = campaigns.filter(
    (campaign) => campaign.deadline > currentTimestamp
  );
  const pastCampaigns = campaigns.filter(
    (campaign) => campaign.deadline <= currentTimestamp
  );
  
  return (
    <div className="p-6">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row justify-between items-center text-white rounded-lg p-10 shadow-lg">
        <div className="md:w-1/2">
          <h1 className="text-4xl font-bold">Give Kindness</h1>
          <p className="text-lg text-gray-300 mt-4">
            People around the globe are getting together to help bigger causes.
            Join along.
          </p>
          <button
            onClick={scrollToCampaigns}
            className="mt-16 px-6 py-3 bg-violet-400 hover:bg-violet-500 text-black font-semibold rounded-lg shadow-md transition-all duration-300"
          >
            View Campaigns
          </button>
        </div>
        <div className="md:w-1/2 mt-6 md:mt-0 flex justify-center">
          <img
            src={heroImg}
            alt="Giving kindness"
            className="max-w-full h-auto"
          />
        </div>
      </section>

      {/* Why Donately Section */}
      <section className="text-center mt-16 mb-16">
        <h2 className="text-3xl font-semibold text-gray-100">Why Donately?</h2>
        <p className="text-gray-400 mt-3">
          We’ve built our reputation by serving and supporting communities all
          over the world.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mt-10">
          {/* Trust Card */}
          <div className="p-6 mx-12 rounded-lg shadow-lg w-64 text-center">
            <img src={trust} alt="Trust" className="w-12 mx-auto mb-3" />
            <h3 className="text-xl text-white font-medium">Trust</h3>
            <p className="text-gray-400 mt-2">
              We ensure transparency and credibility in every donation.
            </p>
          </div>

          {/* Speed Card */}
          <div className="mx-12 p-6 rounded-lg shadow-lg w-64 text-center">
            <img src={quick} alt="Speed" className="w-12 mx-auto mb-3" />
            <h3 className="text-xl text-white font-medium">Speed</h3>
            <p className="text-gray-400 mt-2">
              Funds are processed quickly to reach those in need without delays.
            </p>
          </div>

          {/* Reach Card */}
          <div className="mx-12 p-6 rounded-lg shadow-lg w-64 text-center">
            <img src={reach} alt="Reach" className="w-12 mx-auto mb-3" />
            <h3 className="text-xl text-white font-medium">Reach</h3>
            <p className="text-gray-400 mt-2">
              We connect donors and beneficiaries from all over the world.
            </p>
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section id="campaigns-section">
        {/* Active Campaigns */}
        <DisplayCampaigns
          title="Active Campaigns"
          isLoading={isLoading}
          campaigns={activeCampaigns}
        />

        {/* Past Campaigns */}
        <DisplayCampaigns
          title="Past Campaigns"
          isLoading={isLoading}
          campaigns={pastCampaigns}
        />
      </section>
    </div>
  );
};

export default Home;
