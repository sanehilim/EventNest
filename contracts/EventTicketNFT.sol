// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract EventTicketNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, IERC2981 {
    uint256 private _tokenIdCounter;
    
    struct TicketInfo {
        string eventId;
        address attendee;
        uint256 mintedAt;
        bool checkedIn;
        bool isResellable;
    }
    
    struct EventInfo {
        address creator;
        uint256 ticketPrice;
        uint256 maxSupply;
        uint256 soldCount;
        bool isActive;
        string metadataURI;
        uint96 royaltyBps; // Royalty basis points (e.g., 250 = 2.5%)
    }
    
    mapping(uint256 => TicketInfo) public ticketInfo;
    mapping(string => EventInfo) public events;
    mapping(string => mapping(address => uint256)) public attendeeTickets;
    mapping(uint256 => uint256) public resalePrice;
    
    // ERC-2981 royalty info
    uint96 public constant DEFAULT_ROYALTY_BPS = 250; // 2.5% default royalty
    
    event TicketMinted(address indexed attendee, string eventId, uint256 tokenId, uint256 price);
    event EventCreated(string indexed eventId, address indexed creator, uint256 maxSupply, uint256 ticketPrice);
    event TicketCheckedIn(uint256 indexed tokenId, string eventId);
    event TicketListedForResale(uint256 indexed tokenId, uint256 price);
    event TicketResold(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price);
    event FundsWithdrawn(address indexed creator, string eventId, uint256 amount);
    
    constructor() ERC721("EventNest Ticket", "EVNT") Ownable(msg.sender) {}
    
    function createEvent(
        string memory eventId,
        uint256 maxSupply,
        uint256 ticketPrice,
        string memory metadataURI,
        uint96 royaltyBps
    ) external {
        require(events[eventId].creator == address(0), "Event already exists");
        require(maxSupply > 0, "Max supply must be greater than 0");
        require(royaltyBps <= 1000, "Royalty cannot exceed 10%");
        
        events[eventId] = EventInfo({
            creator: msg.sender,
            ticketPrice: ticketPrice,
            maxSupply: maxSupply,
            soldCount: 0,
            isActive: true,
            metadataURI: metadataURI,
            royaltyBps: royaltyBps > 0 ? royaltyBps : DEFAULT_ROYALTY_BPS
        });
        
        emit EventCreated(eventId, msg.sender, maxSupply, ticketPrice);
    }
    
    function mintTicket(
        address to,
        string memory eventId,
        string memory tokenURI
    ) external payable nonReentrant returns (uint256) {
        EventInfo storage eventInfo = events[eventId];
        require(eventInfo.isActive, "Event is not active");
        require(eventInfo.soldCount < eventInfo.maxSupply, "Event sold out");
        require(msg.value >= eventInfo.ticketPrice, "Insufficient payment");
        require(attendeeTickets[eventId][to] == 0, "Already owns ticket");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        ticketInfo[tokenId] = TicketInfo({
            eventId: eventId,
            attendee: to,
            mintedAt: block.timestamp,
            checkedIn: false,
            isResellable: true
        });
        
        attendeeTickets[eventId][to] = tokenId;
        eventInfo.soldCount++;
        
        if (msg.value > eventInfo.ticketPrice) {
            payable(msg.sender).transfer(msg.value - eventInfo.ticketPrice);
        }
        
        emit TicketMinted(to, eventId, tokenId, eventInfo.ticketPrice);
        return tokenId;
    }
    
    function checkInTicket(uint256 tokenId) external {
        TicketInfo storage ticket = ticketInfo[tokenId];
        EventInfo storage eventInfo = events[ticket.eventId];
        
        require(msg.sender == eventInfo.creator, "Only event creator can check-in");
        require(!ticket.checkedIn, "Ticket already checked in");
        require(ownerOf(tokenId) == ticket.attendee, "Ticket transferred");
        
        ticket.checkedIn = true;
        emit TicketCheckedIn(tokenId, ticket.eventId);
    }
    
    function listTicketForResale(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not ticket owner");
        require(ticketInfo[tokenId].isResellable, "Ticket not resellable");
        require(!ticketInfo[tokenId].checkedIn, "Ticket already used");
        require(price > 0, "Price must be greater than 0");
        
        resalePrice[tokenId] = price;
        emit TicketListedForResale(tokenId, price);
    }
    
    function buyResaleTicket(uint256 tokenId) external payable nonReentrant {
        uint256 price = resalePrice[tokenId];
        require(price > 0, "Ticket not for sale");
        require(msg.value >= price, "Insufficient payment");
        
        address seller = ownerOf(tokenId);
        string memory eventId = ticketInfo[tokenId].eventId;
        EventInfo storage eventInfo = events[eventId];
        
        require(attendeeTickets[eventId][msg.sender] == 0, "Already owns ticket");
        
        attendeeTickets[eventId][seller] = 0;
        attendeeTickets[eventId][msg.sender] = tokenId;
        ticketInfo[tokenId].attendee = msg.sender;
        
        resalePrice[tokenId] = 0;
        
        _transfer(seller, msg.sender, tokenId);
        
        // Calculate royalties (to event creator)
        uint256 royaltyAmount = (price * eventInfo.royaltyBps) / 10000;
        uint256 platformFee = (price * 25) / 1000; // 2.5% platform fee
        uint256 sellerAmount = price - royaltyAmount - platformFee;
        
        // Transfer funds
        payable(seller).transfer(sellerAmount);
        payable(eventInfo.creator).transfer(royaltyAmount);
        
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        emit TicketResold(tokenId, seller, msg.sender, price);
    }
    
    // ERC-2981 Royalty Standard
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        TicketInfo memory ticket = ticketInfo[tokenId];
        EventInfo memory eventInfo = events[ticket.eventId];
        
        if (eventInfo.creator == address(0)) {
            return (address(0), 0);
        }
        
        royaltyAmount = (salePrice * eventInfo.royaltyBps) / 10000;
        return (eventInfo.creator, royaltyAmount);
    }
    
    function withdrawEventFunds(string memory eventId) external nonReentrant {
        EventInfo storage eventInfo = events[eventId];
        require(msg.sender == eventInfo.creator, "Not event creator");
        
        uint256 amount = eventInfo.ticketPrice * eventInfo.soldCount;
        require(amount > 0, "No funds to withdraw");
        
        eventInfo.soldCount = 0;
        
        payable(msg.sender).transfer(amount);
        emit FundsWithdrawn(msg.sender, eventId, amount);
    }
    
    function deactivateEvent(string memory eventId) external {
        require(events[eventId].creator == msg.sender, "Not event creator");
        events[eventId].isActive = false;
    }
    
    function getEventInfo(string memory eventId) external view returns (EventInfo memory) {
        return events[eventId];
    }
    
    function getTicketInfo(uint256 tokenId) external view returns (TicketInfo memory) {
        return ticketInfo[tokenId];
    }
    
    function hasTicketForEvent(address user, string memory eventId) external view returns (bool) {
        return attendeeTickets[eventId][user] != 0;
    }
    
    // Verify ticket ownership and validity
    function verifyTicket(uint256 tokenId, address owner) external view returns (bool) {
        if (ownerOf(tokenId) != owner) {
            return false;
        }
        TicketInfo memory ticket = ticketInfo[tokenId];
        if (ticket.checkedIn) {
            return false;
        }
        EventInfo memory eventInfo = events[ticket.eventId];
        return eventInfo.isActive;
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
    
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }
}
