export const SIMPLIFIED_RAFFLE_ABI = [
  "function createRaffle(string memory _title, uint256 _ticketPrice, uint256 _maxTickets) external returns (uint256)",
  "function buyTicket(uint256 _raffleId) external payable",
  "function completeRaffle(uint256 _raffleId) external",
  "function getRaffle(uint256 _raffleId) external view returns (tuple(uint256 id, address creator, string title, uint256 ticketPrice, uint256 maxTickets, uint256 ticketsSold, address winner, bool isCompleted, uint256 prizePool))",
  "function getUserTickets(address _user, uint256 _raffleId) external view returns (uint256[] memory)",
  "function getActiveRaffles() external view returns (uint256[] memory)",
  "event RaffleCreated(uint256 indexed raffleId, address indexed creator, string title, uint256 ticketPrice, uint256 maxTickets)",
  "event TicketPurchased(uint256 indexed raffleId, address indexed buyer, uint256 ticketNumber)",
  "event RaffleCompleted(uint256 indexed raffleId, address indexed winner, uint256 prizeAmount)",
] as const

export const CONTRACT_CONFIG = {
  // You'll update this after deployment
  address: "0x0000000000000000000000000000000000000000",
  abi: SIMPLIFIED_RAFFLE_ABI,
} as const
