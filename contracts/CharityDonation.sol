// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CharityDonationSystem {

    struct Campaign {
        address owner;
        string title;
        string description;
        string publicDocsCID; // IPFS CID for public documents
        string category;
        uint256 goalAmount;
        uint256 deadline;
        uint256 amountRaised;
        bool verified;
        bool isWithdrawn;
        bool exists;
        mapping(address => uint256) donations; // Tracks donor amounts
        mapping(address => string) donationMessages;
        address[] donorAddresses; // Tracks unique donor addresses
    }

     // This struct is for view purposes only (mappings are excluded)
    struct CampaignView {
        address owner;
        string title;
        string description;
        string publicDocsCID;
        string category;
        uint256 goalAmount;
        uint256 deadline;
        uint256 amountRaised;
        bool verified;
        bool isWithdrawn;
        bool exists;
        address[] donorAddresses;
    }



    address public admin;
    mapping(uint256 => Campaign) public campaigns;
    uint public campaignCount = 0;

    event CampaignCreated(uint campaignId, address owner, string title);
    event CampaignVerified(uint campaignId);
    event FundsReleased(uint campaignId, uint amount);
    event Donated(address indexed donor, uint campaignId, uint amount,string message);
    event Refunded(address indexed donor, uint campaignId, uint amount);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == admin, "Only the contract owner can perform this action.");
        _;
    }

    function createCampaign(
        string memory _title,
        string memory _description,
        string memory _publicDocsCID,
        string memory _category,
        uint256 _goalAmount,
        uint256 _deadline
    ) external  {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        Campaign storage newCampaign = campaigns[campaignCount];
        newCampaign.owner = msg.sender;
        newCampaign.title = _title;
        newCampaign.description = _description;
        newCampaign.publicDocsCID = _publicDocsCID;
         newCampaign.category = _category;
        newCampaign.goalAmount = _goalAmount;
        newCampaign.deadline = _deadline;
        newCampaign.amountRaised = 0;
        newCampaign.verified = false;
        newCampaign.isWithdrawn = false;
        newCampaign.exists = true;
        emit CampaignCreated(campaignCount, msg.sender ,_title);

        campaignCount++;
    }

    function verifyCampaign(uint _campaignId) external onlyOwner {
        require(_campaignId < campaignCount, "Invalid campaign ID");
        require(!campaigns[_campaignId].verified, "Already verified");
        campaigns[_campaignId].verified = true;
        emit CampaignVerified(_campaignId);
    }

    function donate(uint _campaignId, string memory _message) external payable {
        require(_campaignId < campaignCount, "Invalid campaign ID");
        require(campaigns[_campaignId].exists, "Campaign deleted");

        Campaign storage campaign = campaigns[_campaignId];
        
        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(msg.value > 0, "Donation amount must be greater than zero");
        require(campaign.verified, "Campaign not approved by admin");
        
        // Update donor's total donation
        if (campaign.donations[msg.sender] == 0) { // First-time donor
            campaign.donorAddresses.push(msg.sender);
        }
        campaign.donations[msg.sender] += msg.value;
        campaign.donationMessages[msg.sender] = _message;
        campaign.amountRaised += msg.value;
       
        emit Donated(msg.sender, _campaignId, msg.value, _message);

    }

    function getDonors(uint256 _campaignId) public view returns (address[] memory, uint256[] memory, string[] memory) {
        require(_campaignId < campaignCount, "Invalid campaign ID");
        Campaign storage campaign = campaigns[_campaignId];

        address[] memory donors = campaign.donorAddresses;
        uint256[] memory amounts = new uint256[](donors.length);
        string[] memory messages = new string[](donors.length);

        for (uint256 i = 0; i < donors.length; i++) {
            amounts[i] = campaign.donations[donors[i]];
            messages[i] = campaign.donationMessages[donors[i]];
        }

        return (donors, amounts, messages);
    }


     function getCampaigns() public view returns (CampaignView[] memory) {
        uint256 validCount = 0;
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].exists) {
                validCount++;
            }
        }

        CampaignView[] memory validCampaigns = new CampaignView[](validCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].exists) {
                Campaign storage camp = campaigns[i];
                validCampaigns[currentIndex] = CampaignView({
                    owner: camp.owner,
                    title: camp.title,
                    description: camp.description,
                    publicDocsCID: camp.publicDocsCID,
                    category: camp.category,
                    goalAmount: camp.goalAmount,
                    deadline: camp.deadline,
                    amountRaised: camp.amountRaised,
                    verified: camp.verified,
                    isWithdrawn: camp.isWithdrawn,
                    exists: camp.exists,
                    donorAddresses: camp.donorAddresses
                });
                currentIndex++;
            }
        }
        return validCampaigns;
    }


    function releaseFunds(uint _campaignId) external {
        require(_campaignId < campaignCount, "Invalid campaign ID");
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == admin || msg.sender == campaign.owner, "Not authorized");
        require(block.timestamp >= campaign.deadline, "Campaign deadline not reached");
        require(!campaign.isWithdrawn, "Funds already released");
        require(campaign.verified, "Campaign not approved");
        
        (bool success,) = payable(campaign.owner).call{value: campaign.amountRaised}("");
        require(success, "Transfer failed");
        emit FundsReleased(_campaignId, campaign.amountRaised);
        campaign.isWithdrawn = true;
    }

    function refund(uint _campaignId) external {
        require(_campaignId < campaignCount, "Invalid campaign ID");
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp >= campaign.deadline, "Campaign still active");
        require(campaign.amountRaised < campaign.goalAmount, "Goal met, cannot refund");
        require(!campaign.isWithdrawn, "Funds already released");
        
        uint256 amount = campaign.donations[msg.sender];
        require(amount > 0, "No donation to refund");
        
        campaign.donations[msg.sender] = 0;
        campaign.amountRaised -= amount;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Refund failed");
        emit Refunded(msg.sender, _campaignId, amount);
    }

    function deleteCampaign(uint256 _id) public {
        require(_id < campaignCount, "Campaign does not exist");
        require(campaigns[_id].owner == msg.sender, "Only the owner can delete the campaign");
        require(campaigns[_id].amountRaised == 0, "Cannot delete after donations received");
        campaigns[_id].exists = false;
    }

    function getUserDonationHistory(address _user) external view returns (string[] memory, uint256[] memory) {
        uint256 count = 0;

        // First, count the number of campaigns the user donated to
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].donations[_user] > 0) {
                count++;
            }
        }

        // Create arrays of the correct size
        string[] memory campaignTitles = new string[](count);
        uint256[] memory amounts = new uint256[](count);
        uint256 index = 0;

        // Populate the arrays
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].donations[_user] > 0) {
                campaignTitles[index] = campaigns[i].title;
                amounts[index] = campaigns[i].donations[_user];
                index++;
            }
        }

        return (campaignTitles, amounts);
    }

     function getCampaignsByCategory(string memory _category) public view returns (CampaignView[] memory) {
        uint256 validCount = 0;
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].exists && keccak256(abi.encodePacked(campaigns[i].category)) == keccak256(abi.encodePacked(_category))) {
                validCount++;
            }
        }

        CampaignView[] memory filteredCampaigns = new CampaignView[](validCount);
        uint256 index = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].exists && keccak256(abi.encodePacked(campaigns[i].category)) == keccak256(abi.encodePacked(_category))) {
                Campaign storage camp = campaigns[i];
                filteredCampaigns[index] = CampaignView({
                    owner: camp.owner,
                    title: camp.title,
                    description: camp.description,
                    publicDocsCID: camp.publicDocsCID,
                    category: camp.category,
                    goalAmount: camp.goalAmount,
                    deadline: camp.deadline,
                    amountRaised: camp.amountRaised,
                    verified: camp.verified,
                    isWithdrawn: camp.isWithdrawn,
                    exists: camp.exists,
                    donorAddresses: camp.donorAddresses
                });
                index++;
            }
        }

        return filteredCampaigns;
    }
}
