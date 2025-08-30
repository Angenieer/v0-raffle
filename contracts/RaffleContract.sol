// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract RaffleContract is ReentrancyGuard, Ownable, Pausable {
    struct Raffle {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 ticketsSold;
        uint256 endTime;
        address winner;
        bool isActive;
        bool isCompleted;
        uint256 prizeAmount;
    }

    struct Ticket {
        uint256 raffleId;
        address owner;
        uint256 ticketNumber;
    }

    mapping(uint256 => Raffle) public raffles;
    mapping(uint256 => Ticket[]) public raffleTickets;
    mapping(address => uint256[]) public userRaffles;
    mapping(address => mapping(uint256 => uint256[])) public userTickets;
    
    uint256 public nextRaffleId = 1;
    uint256 public platformFeePercentage = 250; // 2.5%
    address public feeRecipient;
    
    event RaffleCreated(
        uint256 indexed raffleId,
        address indexed creator,
        string title,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 endTime
    );
    
    event TicketPurchased(
        uint256 indexed raffleId,
        address indexed buyer,
        uint256 ticketNumber,
        uint256 amount
    );
    
    event RaffleCompleted(
        uint256 indexed raffleId,
        address indexed winner,
        uint256 prizeAmount
    );
    
    event RaffleCancelled(uint256 indexed raffleId);
    
    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }
    
    modifier raffleExists(uint256 _raffleId) {
        require(_raffleId > 0 && _raffleId < nextRaffleId, "Raffle does not exist");
        _;
    }
    
    modifier raffleActive(uint256 _raffleId) {
        require(raffles[_raffleId].isActive, "Raffle is not active");
        require(block.timestamp < raffles[_raffleId].endTime, "Raffle has ended");
        require(!raffles[_raffleId].isCompleted, "Raffle is completed");
        _;
    }
    
    function createRaffle(
        string memory _title,
        string memory _description,
        uint256 _ticketPrice,
        uint256 _maxTickets,
        uint256 _duration
    ) external whenNotPaused returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        require(_maxTickets > 0, "Max tickets must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        
        uint256 raffleId = nextRaffleId++;
        uint256 endTime = block.timestamp + _duration;
        
        raffles[raffleId] = Raffle({
            id: raffleId,
            creator: msg.sender,
            title: _title,
            description: _description,
            ticketPrice: _ticketPrice,
            maxTickets: _maxTickets,
            ticketsSold: 0,
            endTime: endTime,
            winner: address(0),
            isActive: true,
            isCompleted: false,
            prizeAmount: 0
        });
        
        userRaffles[msg.sender].push(raffleId);
        
        emit RaffleCreated(raffleId, msg.sender, _title, _ticketPrice, _maxTickets, endTime);
        
        return raffleId;
    }
    
    function buyTickets(uint256 _raffleId, uint256 _quantity) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        raffleExists(_raffleId) 
        raffleActive(_raffleId) 
    {
        Raffle storage raffle = raffles[_raffleId];
        
        require(_quantity > 0, "Quantity must be greater than 0");
        require(raffle.ticketsSold + _quantity <= raffle.maxTickets, "Not enough tickets available");
        require(msg.value == raffle.ticketPrice * _quantity, "Incorrect payment amount");
        
        // Add tickets to the raffle
        for (uint256 i = 0; i < _quantity; i++) {
            uint256 ticketNumber = raffle.ticketsSold + i + 1;
            
            raffleTickets[_raffleId].push(Ticket({
                raffleId: _raffleId,
                owner: msg.sender,
                ticketNumber: ticketNumber
            }));
            
            userTickets[msg.sender][_raffleId].push(ticketNumber);
            
            emit TicketPurchased(_raffleId, msg.sender, ticketNumber, raffle.ticketPrice);
        }
        
        raffle.ticketsSold += _quantity;
        raffle.prizeAmount += msg.value;
        
        // Auto-complete raffle if all tickets are sold
        if (raffle.ticketsSold == raffle.maxTickets) {
            _completeRaffle(_raffleId);
        }
    }
    
    function completeRaffle(uint256 _raffleId) 
        external 
        raffleExists(_raffleId) 
    {
        Raffle storage raffle = raffles[_raffleId];
        require(
            block.timestamp >= raffle.endTime || raffle.ticketsSold == raffle.maxTickets,
            "Raffle cannot be completed yet"
        );
        require(raffle.isActive && !raffle.isCompleted, "Raffle is not active or already completed");
        
        _completeRaffle(_raffleId);
    }
    
    function _completeRaffle(uint256 _raffleId) internal {
        Raffle storage raffle = raffles[_raffleId];
        
        if (raffle.ticketsSold == 0) {
            // No tickets sold, cancel raffle
            raffle.isActive = false;
            raffle.isCompleted = true;
            emit RaffleCancelled(_raffleId);
            return;
        }
        
        // Select winner using pseudo-random number
        uint256 winningTicketNumber = _generateRandomNumber(_raffleId) % raffle.ticketsSold + 1;
        address winner = raffleTickets[_raffleId][winningTicketNumber - 1].owner;
        
        raffle.winner = winner;
        raffle.isActive = false;
        raffle.isCompleted = true;
        
        // Calculate platform fee and prize
        uint256 platformFee = (raffle.prizeAmount * platformFeePercentage) / 10000;
        uint256 prizeAmount = raffle.prizeAmount - platformFee;
        
        // Transfer prize to winner
        (bool success, ) = winner.call{value: prizeAmount}("");
        require(success, "Prize transfer failed");
        
        // Transfer fee to platform
        if (platformFee > 0) {
            (bool feeSuccess, ) = feeRecipient.call{value: platformFee}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        emit RaffleCompleted(_raffleId, winner, prizeAmount);
    }
    
    function _generateRandomNumber(uint256 _raffleId) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            block.number,
            _raffleId,
            raffles[_raffleId].ticketsSold
        )));
    }
    
    function cancelRaffle(uint256 _raffleId) 
        external 
        raffleExists(_raffleId) 
    {
        Raffle storage raffle = raffles[_raffleId];
        require(msg.sender == raffle.creator || msg.sender == owner(), "Not authorized");
        require(raffle.isActive && !raffle.isCompleted, "Raffle is not active or already completed");
        require(raffle.ticketsSold == 0, "Cannot cancel raffle with sold tickets");
        
        raffle.isActive = false;
        raffle.isCompleted = true;
        
        emit RaffleCancelled(_raffleId);
    }
    
    // View functions
    function getRaffle(uint256 _raffleId) 
        external 
        view 
        raffleExists(_raffleId) 
        returns (Raffle memory) 
    {
        return raffles[_raffleId];
    }
    
    function getRaffleTickets(uint256 _raffleId) 
        external 
        view 
        raffleExists(_raffleId) 
        returns (Ticket[] memory) 
    {
        return raffleTickets[_raffleId];
    }
    
    function getUserRaffles(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userRaffles[_user];
    }
    
    function getUserTickets(address _user, uint256 _raffleId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userTickets[_user][_raffleId];
    }
    
    function getActiveRaffles() external view returns (uint256[] memory) {
        uint256[] memory activeRaffles = new uint256[](nextRaffleId - 1);
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextRaffleId; i++) {
            if (raffles[i].isActive && block.timestamp < raffles[i].endTime) {
                activeRaffles[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeRaffles[i];
        }
        
        return result;
    }
    
    // Admin functions
    function setPlatformFee(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee cannot exceed 10%");
        platformFeePercentage = _feePercentage;
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Emergency function to withdraw stuck funds
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Emergency withdrawal failed");
    }
}
