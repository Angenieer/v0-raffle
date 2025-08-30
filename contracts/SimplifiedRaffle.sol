// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimplifiedRaffle {
    struct Raffle {
        uint256 id;
        address creator;
        string title;
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 ticketsSold;
        address winner;
        bool isCompleted;
        uint256 prizePool;
    }

    struct Ticket {
        address owner;
        uint256 ticketNumber;
    }

    mapping(uint256 => Raffle) public raffles;
    mapping(uint256 => Ticket[]) public raffleTickets;
    mapping(address => mapping(uint256 => uint256[])) public userTickets;
    
    uint256 public nextRaffleId = 1;
    
    event RaffleCreated(uint256 indexed raffleId, address indexed creator, string title, uint256 ticketPrice, uint256 maxTickets);
    event TicketPurchased(uint256 indexed raffleId, address indexed buyer, uint256 ticketNumber);
    event RaffleCompleted(uint256 indexed raffleId, address indexed winner, uint256 prizeAmount);
    
    function createRaffle(
        string memory _title,
        uint256 _ticketPrice,
        uint256 _maxTickets
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(_ticketPrice > 0, "Price must be > 0");
        require(_maxTickets > 0 && _maxTickets <= 100, "Max 100 tickets");
        
        uint256 raffleId = nextRaffleId++;
        
        raffles[raffleId] = Raffle({
            id: raffleId,
            creator: msg.sender,
            title: _title,
            ticketPrice: _ticketPrice,
            maxTickets: _maxTickets,
            ticketsSold: 0,
            winner: address(0),
            isCompleted: false,
            prizePool: 0
        });
        
        emit RaffleCreated(raffleId, msg.sender, _title, _ticketPrice, _maxTickets);
        return raffleId;
    }
    
    function buyTicket(uint256 _raffleId) external payable {
        Raffle storage raffle = raffles[_raffleId];
        
        require(_raffleId > 0 && _raffleId < nextRaffleId, "Invalid raffle");
        require(!raffle.isCompleted, "Raffle completed");
        require(raffle.ticketsSold < raffle.maxTickets, "Sold out");
        require(msg.value == raffle.ticketPrice, "Wrong payment");
        
        uint256 ticketNumber = raffle.ticketsSold + 1;
        
        raffleTickets[_raffleId].push(Ticket({
            owner: msg.sender,
            ticketNumber: ticketNumber
        }));
        
        userTickets[msg.sender][_raffleId].push(ticketNumber);
        
        raffle.ticketsSold++;
        raffle.prizePool += msg.value;
        
        emit TicketPurchased(_raffleId, msg.sender, ticketNumber);
        
        if (raffle.ticketsSold == raffle.maxTickets) {
            _selectWinner(_raffleId);
        }
    }
    
    function completeRaffle(uint256 _raffleId) external {
        Raffle storage raffle = raffles[_raffleId];
        require(msg.sender == raffle.creator, "Only creator");
        require(!raffle.isCompleted, "Already completed");
        require(raffle.ticketsSold > 0, "No tickets sold");
        
        _selectWinner(_raffleId);
    }
    
    function _selectWinner(uint256 _raffleId) internal {
        Raffle storage raffle = raffles[_raffleId];
        
        // Simple pseudo-random selection
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            _raffleId
        ))) % raffle.ticketsSold;
        
        address winner = raffleTickets[_raffleId][randomIndex].owner;
        raffle.winner = winner;
        raffle.isCompleted = true;
        
        // Transfer 95% to winner, 5% stays as platform fee
        uint256 prizeAmount = (raffle.prizePool * 95) / 100;
        
        (bool success, ) = winner.call{value: prizeAmount}("");
        require(success, "Transfer failed");
        
        emit RaffleCompleted(_raffleId, winner, prizeAmount);
    }
    
    function getRaffle(uint256 _raffleId) external view returns (Raffle memory) {
        return raffles[_raffleId];
    }
    
    function getUserTickets(address _user, uint256 _raffleId) external view returns (uint256[] memory) {
        return userTickets[_user][_raffleId];
    }
    
    function getActiveRaffles() external view returns (uint256[] memory) {
        uint256[] memory active = new uint256[](nextRaffleId - 1);
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextRaffleId; i++) {
            if (!raffles[i].isCompleted) {
                active[count] = i;
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = active[i];
        }
        
        return result;
    }
}
