// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;
import 'hardhat/console.sol';
contract Registry {
    uint256 lastRenter;

    function setSSN(uint256 _ssn) public {
        console.log("setSSN called");
        lastRenter = _ssn;
    }
}