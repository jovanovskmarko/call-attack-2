// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

contract RegistryLibrary {
    uint256 currentRenter;

    function setCurrentRenter(uint256 _SSN) public {
        currentRenter = _SSN;
    }
}