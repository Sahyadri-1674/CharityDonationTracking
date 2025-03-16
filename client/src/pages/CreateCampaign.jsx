import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";
import { useStateContext } from "../context";
import { money } from "../assets";
import { CustomButton, FormField, Loader } from "../components";
import { checkIfImage } from "../utils";

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { createCampaign } = useStateContext();

  const [form, setForm] = useState({
    title: "",
    description: "",
    goalAmount: "",
    deadline: "",
    category: "Medical",
    document: null,
  });

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, document: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!createCampaign) {
      alert("Please connect your wallet before creating a campaign.");
      return;
    }

    if (!form.document) {
      alert("Please upload a document related to your campaign.");
      return;
    }

    if (
      !form.title ||
      !form.description ||
      !form.goalAmount ||
      !form.deadline ||
      !form.category
    ) {
      alert("Please fill all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      // Upload file to Pinata IPFS
      const { cid, fileExtension } = await uploadFileToPinata(form.document);

      // Convert target to Wei
      const goalAmountInWei = ethers.utils.parseUnits(form.goalAmount, 18);

      // Call the smart contract function
      await createCampaign({
        ...form,
        publicDocsCID: `${cid}.${fileExtension}`,
        goalAmount: goalAmountInWei,
      });

      navigate("/");
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign. Check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFileToPinata = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    // Extract the file extension
    const fileExtension = file.name.split(".").pop().toLowerCase();

    const pinataMetadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        fileExtension: fileExtension, // Store the file extension
      },
    });

    formData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });

    formData.append("pinataOptions", pinataOptions);

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
          pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_API_KEY,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (res.status === 200) {
      return {
        cid: res.data.IpfsHash, // Return the CID
        fileExtension: fileExtension, // Return the file extension
      }; // Return the CID of the uploaded file
    } else {
      throw new Error("Failed to upload document to IPFS.");
    }
  };

  return (
    <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
      {isLoading && <Loader />}
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">
          Start a Charity Campaign
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full mt-[65px] flex flex-col gap-[30px]"
      >
        <div className="flex flex-wrap gap-[40px]">
          <FormField
            labelName="Charity Title *"
            placeholder="Write a title"
            inputType="text"
            value={form.title}
            handleChange={(e) => handleFormFieldChange("title", e)}
          />
        </div>

        <FormField
          labelName="Story *"
          placeholder="Write your story"
          isTextArea
          value={form.description}
          handleChange={(e) => handleFormFieldChange("description", e)}
        />

        <div className="flex flex-wrap gap-[40px]">
          <FormField
            labelName="Goal *"
            placeholder="ETH 0.50"
            inputType="text"
            value={form.goalAmount}
            handleChange={(e) => handleFormFieldChange("goalAmount", e)}
          />
          <FormField
            labelName="End Date *"
            placeholder="End Date"
            inputType="date"
            value={form.deadline}
            handleChange={(e) => handleFormFieldChange("deadline", e)}
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex flex-wrap gap-[40px]">
          <div className="flex flex-col w-full">
            <label className="text-white mb-2">Category *</label>
            <select
              value={form.category}
              onChange={(e) => handleFormFieldChange("category", e)}
              className="p-2 bg-[#3a3a43] text-white rounded-md"
            >
              <option value="Medical">Medical</option>
              <option value="Education">Education</option>
              <option value="Animal">Animal</option>
              <option value="Environment">Environment</option>
              <option value="Emergency">Emergency</option>
              <option value="Family">Family</option>
            </select>
          </div>
        </div>

        {/* File Upload */}
        <FormField
          labelName="Upload Document *"
          placeholder="Upload a document"
          inputType="file"
          handleChange={handleFileChange}
        />

        <div className="flex justify-center items-center mt-[40px]">
          <CustomButton
            btnType="submit"
            title="Submit new charity"
            styles="bg-[#1dc071]"
          />
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;
