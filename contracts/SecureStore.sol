// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SecureStore {
    address public registryAddress;
    address public owner;
    uint256 public pricePerDay;
    uint256 public rentedUntil;
    address public USDC;
    // renter address => block.timestamp deadline until when
    mapping(address => uint256) public renters;

    // TODO change to setSSNFunctionSignature
    bytes4 constant setSSNFunctionSignature = bytes4(keccak256("setCurrentRenter(uint256)"));

    constructor(address _registryAddress, uint256 _price, address _USDC) {
        registryAddress = _registryAddress;
        owner = msg.sender;
        pricePerDay = _price;
        USDC = _USDC;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can withdraw!");
        _;
    }

    // TODO change to current
    modifier onlyCurrentRenter() {
        require(renters[msg.sender] > block.timestamp, "You are not the current renter!");
        _;
    }

    event RentedFor(uint256 numDays);

    function setRentPrice(uint256 _price) public onlyOwner {
        pricePerDay = _price;
    }

    function rentWarehouse(uint256 _numDays, uint256 _SSN) external {
        // Cannot be rented by multiple users at the same time
        require(block.timestamp >= rentedUntil, "Warehouse is already rented!");
        uint256 requiredAmount = _numDays * pricePerDay;
        rentedUntil = block.timestamp + _numDays * 1 days;
        renters[msg.sender] = rentedUntil;
        IERC20(USDC).transferFrom(msg.sender, address(this), requiredAmount);
        // TODO check return value
        registryAddress.delegatecall(abi.encodePacked(setSSNFunctionSignature, _SSN));
        emit RentedFor(_numDays);
    }

    function terminateRental() external onlyCurrentRenter {
        uint256 remainingDays = (renters[msg.sender] - block.timestamp) / 1 days;
        uint256 refundAmount = remainingDays * pricePerDay;

        if (rentedUntil == renters[msg.sender]) {
            // change the rentedUntil so it will be free from this moment onwards
            rentedUntil = block.timestamp;
            // change until when the current renter rented the warehouse
            renters[msg.sender] = rentedUntil;
        }
        // TODO check if the transfer is completed
        IERC20(USDC).transfer(msg.sender, refundAmount);
    }

    function withdrawAll() public onlyOwner {
        uint256 balanceOfContract = IERC20(USDC).balanceOf(address(this));
        IERC20(USDC).transfer(msg.sender, balanceOfContract);
    }
}

