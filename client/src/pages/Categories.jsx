import React, { useState, useEffect } from "react";
import { DisplayCampaigns } from "../components";
import { useStateContext } from "../context";
import {
  FaBriefcaseMedical,
  FaGraduationCap,
  FaPaw,
  FaUsers,
  FaHandsHelping,
  FaChurch,
  FaTree,
  FaTrophy,
  FaFutbol,
  FaGlobeAmericas,
  FaBusinessTime,
  FaLightbulb,
  FaCalendarAlt,
  FaHome,
  FaPlane,
  FaHandHoldingHeart,
} from "react-icons/fa";
import { GiCandleLight, GiRibbon, GiHeartWings } from "react-icons/gi";

const categories = [
  { name: "Medical", icon: <FaBriefcaseMedical /> },
  { name: "Memorial", icon: <GiCandleLight /> },
  { name: "Emergency", icon: <FaGlobeAmericas /> },
  { name: "Nonprofit", icon: <GiRibbon /> },
  { name: "Education", icon: <FaGraduationCap /> },
  { name: "Animal", icon: <FaPaw /> },
  { name: "Environment", icon: <FaTree /> },
  { name: "Business", icon: <FaBusinessTime /> },
  { name: "Community", icon: <FaUsers /> },
  { name: "Competition", icon: <FaTrophy /> },
  { name: "Creative", icon: <FaLightbulb /> },
  { name: "Event", icon: <FaCalendarAlt /> },
  { name: "Faith", icon: <FaChurch /> },
  { name: "Family", icon: <FaHome /> },
  { name: "Sports", icon: <FaFutbol /> },
  { name: "Travel", icon: <FaPlane /> },
  { name: "Volunteer", icon: <FaHandsHelping /> },
  { name: "Wishes", icon: <GiHeartWings /> },
];

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].name);
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const { contract, getCampaignsByCategory } = useStateContext();

  const fetchCampaigns = async (category) => {
    setIsLoading(true);
    try {
      const data = await getCampaignsByCategory(category);
      setCampaigns(data);
    } catch (error) {
      console.error("Error fetching campaigns by category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contract) fetchCampaigns(selectedCategory);
  }, [contract, selectedCategory]);

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
    <div className="w-full min-h-screen bg-[#1E1E2F] p-10">
      {/* Category Selection */}
      <h2 className="text-white text-2xl font-semibold mb-6">
        Select a Category
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 mb-10">
        {categories.map((category) => (
          <button
            key={category.name}
            className={`flex flex-col items-center p-4 rounded-lg text-white font-medium transition duration-300 
              ${
                selectedCategory === category.name
                  ? "bg-[#5A67D8] border-2 border-[#7F9CF5]"
                  : "bg-[#2E2E40] hover:bg-[#373750]"
              }`}
            onClick={() => setSelectedCategory(category.name)}
          >
            <div className="text-3xl mb-2">{category.icon}</div>
            <span className="text-sm">{category.name}</span>
          </button>
        ))}
      </div>

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
    </div>
  );
};

export default Categories;
