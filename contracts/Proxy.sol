// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

// import "hardhat/console.sol";
import "./StorageSlot.sol";

// EOS -> Proxy -> Logic1
//              -> Logic2

contract Proxy {
    function changeImplementation(address _implementation) external {
        StorageSlot.getAddressSlot(keccak256("impl")).value = _implementation;
    }

    fallback() external {
        (bool success, ) = StorageSlot
            .getAddressSlot(keccak256("impl"))
            .value
            .delegatecall(msg.data);
        require(success);
    }
}

contract Logic1 {
    uint x = 0;

    function changeX(uint _x) external {
        x = _x;
    }
}

contract Logic2 {
    uint x = 0;

    function changeX(uint _x) external {
        x = _x;
    }

    function tripleX() external {
        x *= 3;
    }
}
