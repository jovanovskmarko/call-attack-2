// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

contract Warehouse {
    uint256 lastRenter;

    function setSSN(uint256 _ssn) public {
        lastRenter = _ssn;
    }
}