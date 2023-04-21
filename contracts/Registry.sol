// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

contract Registry {
    uint256 activeRenter;

    function setSSN(uint256 _SSN) public {
        activeRenter = _SSN;
    }
}