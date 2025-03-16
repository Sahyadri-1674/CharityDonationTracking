import React from "react";

import { tagType, thirdweb } from "../assets";
import { daysLeft } from "../utils";
import { ethers } from "ethers";

const FundCard = ({
  owner,
  title,
  description,
  category,
  goalAmount,
  deadline,
  amountCollected,
  handleClick,
  verified,
  publicDocsCID,
}) => {
  const remainingDays = daysLeft(deadline);
  // Function to determine the file type based on the IPFS CID
  const getFileType = (cid) => {
    if (!cid) return null;
    const extension = cid.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(extension)) return "image";
    if (["mp4", "webm", "ogg"].includes(extension)) return "video";
    if (["pdf"].includes(extension)) return "pdf";
    return null;
  };

  const fileType = getFileType(publicDocsCID);
  const cidWithoutExtension = publicDocsCID?.split(".")[0];
  return (
    <div
      className="sm:w-[288px] w-full rounded-[15px] bg-[#1c1c24] cursor-pointer"
      onClick={handleClick}
    >
      {/* Display uploaded document based on file type */}
      {fileType === "image" && (
        <img
          src={`https://ipfs.io/ipfs/${cidWithoutExtension}`}
          alt="fund"
          className="w-full h-[158px] object-cover rounded-[15px]"
        />
      )}
      {fileType === "video" && (
        <video
          src={`https://ipfs.io/ipfs/${cidWithoutExtension}`}
          controls
          className="w-full h-[158px] object-cover rounded-[15px]"
        />
      )}
      {fileType === "pdf" && (
        <iframe
          src={`https://ipfs.io/ipfs/${cidWithoutExtension}`}
          title="PDF Viewer"
          className="w-full h-[158px] rounded-[15px]"
        />
      )}

      <div className="flex flex-col p-4">
        <div className="flex flex-row items-center mb-[18px]">
          <img
            src={tagType}
            alt="tag"
            className="w-[17px] h-[17px] object-contain"
          />
          <p className="ml-[12px] mt-[2px] font-epilogue font-medium text-[12px] text-[#808191]">
            {category}
          </p>
          <div
            className={`relative left-20  px-2 py-1 rounded-full text-xs font-semibold ${
              verified ? "bg-[#4acd8d] text-white" : "bg-[#ff4d4d] text-white"
            }`}
          >
            {verified ? "Verified" : "Unverified"}
          </div>
        </div>

        <div className="block">
          <h3 className="font-epilogue font-semibold text-[16px] text-white text-left leading-[26px] truncate">
            {title}
          </h3>
          <p className="mt-[5px] font-epilogue font-normal text-[#808191] text-left leading-[18px] truncate">
            {description}
          </p>
        </div>

        <div className="flex justify-between flex-wrap mt-[15px] gap-2">
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">
              {amountCollected}
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">
              Raised of {ethers.utils.formatEther(goalAmount.split(".")[0])} ETH
            </p>
          </div>
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">
              {remainingDays}
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">
              Days Left
            </p>
          </div>
        </div>

        <div className="flex items-center mt-[20px] gap-[12px]">
          <div className="w-[30px] h-[30px] rounded-full flex justify-center items-center bg-[#13131a]">
            <img
              src={thirdweb}
              alt="user"
              className="w-1/2 h-1/2 object-contain"
            />
          </div>
          <p className="flex-1 font-epilogue font-normal text-[12px] text-[#808191] truncate">
            by <span className="text-[#b2b3bd]">{owner}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FundCard;
