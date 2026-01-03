// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

interface IBharatVote {
    function initialize(string calldata _name, address _admin) external;
}

contract ElectionFactory {
    error ZeroImplementation();

    event ElectionCreated(address indexed election, address indexed admin, string name);

    address public immutable implementation;

    constructor(address _implementation) {
        if (_implementation == address(0)) revert ZeroImplementation();
        implementation = _implementation;
    }

    function createElection(string calldata _name) external returns (address election) {
        election = Clones.clone(implementation);
        IBharatVote(election).initialize(_name, msg.sender);
        emit ElectionCreated(election, msg.sender, _name);
    }
}
