    // SPDX-License-Identifier: MIT
    pragma solidity 0.8.13;

    import "hardhat/console.sol";
    import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
    contract SecureStore {
        
        address public registry;
        address public owner;
        uint256 lastRenterSSN;
        uint256 public pricePerDay;
        uint256 public rentedUntil;
        address public USDC;
        mapping(address => uint256) public renters;

        bytes4 constant setSSN = bytes4(keccak256("setSSN(uint256)"));

        constructor(address _registryAddress, uint256 _price, address _USDC) {
            registry = _registryAddress;
            owner = msg.sender;
            pricePerDay = _price;
            USDC = _USDC;
        }

        modifier onlyOwner() {
            require(msg.sender == owner, "Only the owner can withdraw!");
            _;
        }

        modifier onlyActiveRenter() {
            require(renters[msg.sender] > block.timestamp, "No active rental found for the caller");
            _;
        }

        event RentedFor(uint256 numDays);

        function setRentPrice(uint256 _price) public onlyOwner{
            pricePerDay = _price;
        }

        function rentWarehouse(uint256 _numDays, uint256 _SSN) external {
            require(block.timestamp >= rentedUntil, "Warehouse is already rented!");
            uint256 requiredAmount = _numDays * pricePerDay;
            rentedUntil = block.timestamp + _numDays * 1 days;
            renters[msg.sender] = rentedUntil;
            IERC20(USDC).transferFrom(msg.sender, address(this), requiredAmount);
            (bool success,) = registry.delegatecall(abi.encodePacked(setSSN, _SSN));
            require(success, "delegate failed");
            emit RentedFor(_numDays);
        }

        function terminateRental() external onlyActiveRenter {
            uint256 remainingDays = (renters[msg.sender] - block.timestamp) / 1 days;
            uint256 refundAmount = remainingDays * pricePerDay;
    
            if (rentedUntil == renters[msg.sender]) {
                rentedUntil = block.timestamp;
                renters[msg.sender] = rentedUntil;
            }

            IERC20(USDC).transfer(msg.sender, refundAmount);
        }

        function withdrawAll() public onlyOwner {
            uint256 balanceOfContract = IERC20(USDC).balanceOf(address(this));
            IERC20(USDC).transfer(msg.sender, balanceOfContract);
        }
    }

