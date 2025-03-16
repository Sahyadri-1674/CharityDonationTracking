import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useStateContext } from "../context";
import { CountBox, CustomButton, Loader } from "../components";
import { calculateBarPercentage, daysLeft } from "../utils";
import { thirdweb } from "../assets";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CampaignDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    donate,
    getDonations,
    contract,
    address,
    releaseFunds,
    admin,
    verifyCampaign,
    refund,
  } = useStateContext();

  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [donators, setDonators] = useState([]);
  const [fileType, setFileType] = useState(null);
  const remainingDays = daysLeft(state.deadline);

  const fetchDonators = async () => {
    const data = await getDonations(state.pId);
    setDonators(data);
  };

  useEffect(() => {
    if (contract) fetchDonators();
  }, [contract, address]);

  const showToast = (message, type) => {
    if (type === "success") {
      toast.success(message, { position: "top-center", autoClose: 3000 });
    } else if (type === "error") {
      toast.error(message, { position: "top-center", autoClose: 3000 });
    }
  };

  const handleDonate = async () => {
    setIsLoading(true);
    try {
      const response = await donate(state.pId, amount, message);
      if (response.success) {
        showToast("Donation Successful!", "success");
      } else {
        showToast(
          `${response.error.data?.message}` || "Unknown Error",
          "error"
        );
      }
      // navigate("/");
    } catch (error) {
      console.error("Error donating:", error);
      showToast(error.message || "Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setIsLoading(true);
    try {
      const response = await releaseFunds(state.pId);
      if (response.success) {
        showToast("Funds withdrawn successfully!", "success");
        navigate("/");
      } else {
        console.error("Error withdrawing funds:", response.error);
        showToast(response.error || "Failed to withdraw funds!", "error");
      }
    } catch (error) {
      console.error(
        "Unexpected error withdrawing funds:",
        error.message || error
      );
      showToast("Unexpected error! Check console for details.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to determine the file type based on the IPFS CID
  const getFileType = (cid) => {
    if (!cid) return null;
    const extension = cid.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(extension)) return "image";
    if (["mp4", "webm", "ogg"].includes(extension)) return "video";
    if (["pdf"].includes(extension)) return "pdf";
    return null;
  };

  useEffect(() => {
    const fetchFileType = async () => {
      const type = await getFileType(state.publicDocsCID);
      setFileType(type);
    };

    if (state.publicDocsCID) fetchFileType();
  }, [state.publicDocsCID]);

  const handleVerifyCampaign = async () => {
    setIsLoading(true);
    try {
      const response = await verifyCampaign(state.pId);
      if (response.success) {
        showToast("Campaign verified successfully!", "success");
        navigate("/");
      } else {
        console.error("Error verifying campaign:", response.error);
        showToast(response.error || "Failed to verify campaign!", "error");
      }
    } catch (error) {
      console.error(
        "Unexpected error verifying campaign:",
        error.message || error
      );
      showToast("Unexpected error! Check console for details.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefund = async () => {
    setIsLoading(true);
    try {
      const response = await refund(state.pId);
      if (response.success) {
        showToast("Refund processed successfully!", "success");
        navigate("/");
      } else {
        console.error("Error refunding donation:", response.error);
        showToast(response.error || "Refund failed!", "error");
      }
    } catch (error) {
      console.error(
        "Unexpected error refunding donation:",
        error.message || error
      );
      showToast("Unexpected error! Check console for details.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to determine if the campaign is eligible for refund
  const isRefundEligible = () => {
    const deadlinePassed = remainingDays <= 0;
    const goalNotMet = state.amountRaised < state.goalAmount;
    const fundsNotWithdrawn = !state.isWithdrawn;
    return deadlinePassed && goalNotMet && fundsNotWithdrawn;
  };

  const cidWithoutExtension = state.publicDocsCID.split(".")[0];
  const goalAmountInWei = state.goalAmount.split(".")[0]; // Remove decimal point
  const amountRaisedInWei = state.amountRaised.split(".")[0]; // Remove decimal point
  return (
    <div>
      {isLoading && <Loader />}
      <ToastContainer />
      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-1 flex-col">
          {/* Display uploaded documents from IPFS */}
          {state.publicDocsCID && (
            <div className="mb-4">
              {fileType === "image" && (
                <img
                  src={`https://ipfs.io/ipfs/${cidWithoutExtension}`}
                  alt="campaign"
                  className="w-full h-[410px] object-cover rounded-xl"
                />
              )}
              {fileType === "video" && (
                <video
                  src={`https://ipfs.io/ipfs/${cidWithoutExtension}`}
                  controls
                  className="w-full h-[410px] object-cover rounded-xl"
                />
              )}
              {fileType === "pdf" && (
                <iframe
                  src={`https://ipfs.io/ipfs/${cidWithoutExtension}`}
                  title="PDF Viewer"
                  className="w-full h-[410px] rounded-xl"
                />
              )}
            </div>
          )}

          <div className="relative w-full h-[5px] bg-[#3a3a43] mt-2">
            <div
              className="absolute h-full bg-[#4acd8d]"
              style={{
                width: `${calculateBarPercentage(
                  state.goalAmount,
                  state.amountRaised
                )}%`,
                maxWidth: "100%",
              }}
            ></div>
          </div>
        </div>
        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
          <CountBox title="Days Left" value={remainingDays} />

          <CountBox
            title={`Raised of ${ethers.utils.formatEther(goalAmountInWei)} ETH`}
            value={state.amountRaised}
          />
          <CountBox title="Total Backers" value={donators.length} />
        </div>
      </div>
      <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
        <div className="flex-[2] flex flex-col gap-[40px]">
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
              Creator
            </h4>
            <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
              <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#2c2f32] cursor-pointer">
                <img
                  src={thirdweb}
                  alt="user"
                  className="w-[60%] h-[60%] object-contain"
                />
              </div>
              <div>
                <h4 className="font-epilogue font-semibold text-[14px] text-white break-all">
                  {state.owner}
                </h4>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
              Story
            </h4>
            <div className="mt-[20px]">
              <div className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">
                {state.description.split("\n").map((line, index) => (
                  <p key={index} className="mb-2">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
              Donators
            </h4>
            <div className="mt-[20px] flex flex-col gap-4">
              {donators.filter((item) => parseFloat(item.donation) > 0).length >
              0 ? (
                donators
                  .filter((item) => parseFloat(item.donation) > 0) // Filter out zero donations
                  .map((item, index) => (
                    <div
                      key={`${item.donator}-${index}`}
                      className="flex justify-between items-center gap-4"
                    >
                      <p className="font-epilogue font-normal text-[16px] text-[#b2b3bd] leading-[26px] break-all">
                        {index + 1}. {item.donator}
                      </p>
                      <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] break-all">
                        {item.donation} ETH
                      </p>
                      <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] break-all">
                        {item.message}
                      </p>
                    </div>
                  ))
              ) : (
                <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">
                  No donators yet. Be the first one!
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 mx-8">
          <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
            Actions
          </h4>

          <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
            {/* Verify Campaign Button (Admin Only) */}
            {address === admin && !state.verified && (
              <CustomButton
                btnType="button"
                title="Verify Campaign"
                styles="w-full bg-[#8c6dfd] mb-4"
                handleClick={handleVerifyCampaign}
              />
            )}

            {/* Refund Button (Donors Only) */}
            {isRefundEligible() && (
              <CustomButton
                btnType="button"
                title="Request Refund"
                styles="w-full bg-[#ff4d4d] mb-4"
                handleClick={handleRefund}
              />
            )}
            <p className="font-epilogue font-medium text-[20px] leading-[30px] text-center text-[#808191]">
              Fund the campaign
            </p>
            <div className="mt-[30px]">
              <input
                type="number"
                placeholder="ETH 0.1"
                step="0.01"
                className="w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px]"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <textarea
                placeholder="Leave a message"
                className="w-full mt-[10px] py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
                <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] text-white">
                  Back it because you believe in it.
                </h4>
                <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-[#808191]">
                  Support the project for no reward, just because it speaks to
                  you.
                </p>
              </div>
              <CustomButton
                btnType="button"
                title="Fund Campaign"
                styles="w-full bg-[#8c6dfd]"
                handleClick={handleDonate}
              />
              {(address === state.owner || address === admin) && (
                <CustomButton
                  btnType="button"
                  title="Withdraw Funds"
                  styles="w-full bg-[#1dc071] mt-4"
                  handleClick={handleWithdraw}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
