// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT1155A is ERC1155, Ownable {
    constructor(string memory uri) ERC1155(uri) Ownable(msg.sender) {}

    function mint(
        address to,
        uint256 tokenId,
        uint256 value
    ) external onlyOwner {
        _mint(to, tokenId, value, "");
    }
}

contract NFT721B is ERC721, Ownable {
    uint _tokenIdCounter;

    constructor(
        address owner,
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(owner) {}

    function mint(address to) external onlyOwner {
        _mint(to, _tokenIdCounter++);
    }
    // _transfer from
}