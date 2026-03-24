// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract GaslessToken is ERC20, EIP712 {
    using ECDSA for bytes32;

    bytes32 private constant EXECUTE_TYPEHASH = keccak256("Execute(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    mapping(address => uint256) public nonces;

    constructor() ERC20("GaslessToken", "GLT") EIP712("GaslessToken", "1") {
        _mint(msg.sender, 1000000 * 10**decimals());
    }

    function executeMetaTransaction(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        require(block.timestamp <= deadline, "Transaction expired");

        bytes32 structHash = keccak256(abi.encode(
            EXECUTE_TYPEHASH,
            owner,
            spender,
            value,
            nonces[owner]++,
            deadline
        ));

        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(hash, v, r, s);

        require(signer == owner, "Invalid signature");
        _approve(owner, spender, value);
    }
}
