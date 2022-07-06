// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;


import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract TetrisGame is Ownable, IERC721Receiver, IERC1155Receiver, ERC721Holder, ERC1155Holder {

    struct NFTGame {
        string name;
        address[] rankingListAddressess;
        uint[] rankingListScores;
        address rewardedNftAddress;
        uint rewardedNftType;
        uint rewardedNftId;
        bool isExist;
    }
    
    mapping(string => NFTGame) public games;
    
    function onERC721Received(address, address, uint256, bytes memory) public virtual override(ERC721Holder, IERC721Receiver) returns (bytes4) {
        return this.onERC721Received.selector;
    }
    
    function onERC1155Received(address, address, uint256, uint256, bytes calldata) pure public override(ERC1155Holder, IERC1155Receiver) returns (bytes4) {
        return this.onERC1155Received.selector;
    }
    
    function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata) pure public override(ERC1155Holder, IERC1155Receiver) returns(bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function getHighScoreAddressess(string memory name) public view returns ([]address) {
       require(games[name].isExist == true, "Error (storeScore): game not found");
       return games[name].rankingListAddressess;
    }

    function getHighScores(string memory name) public view returns ([]uint256) {
       require(games[name].isExist == true, "Error (storeScore): game not found");
       return games[name].rankingListScores;
    }

    function sendReward(string memory name) public payable onlyOwner {

       require(games[name].isExist == true, "Error (storeScore): game not found");
       
        address winner = games[name].rankingListAddressess[games[name].rankingListAddressess.length - 1];

        //ERC721(address(nftAddresses[gameId])).safeTransferFrom(address(this), msg.sender, rewardedNftIds[gameId]);
        
        // 1 -> ERC721
        // 2 -> ERC1155
        if (games[name].rewardedNftType == 1) {
            ERC721(games[name].rewardedNftAddress).safeTransferFrom(address(this), winner, games[name].rewardedNftId);
        } else {
            ERC1155(games[name].rewardedNftAddress).safeTransferFrom(address(this), winner, games[name].rewardedNftId, 1, "0x0");
        }
    }



    function storeScore(string memory name, uint256 value) public {
        require(games[name].isExist == true, "Error (storeScore): game not found");
        require(value > getHighValue(games[name].rankingListScores), "Error (storeScore): low score");

        games[name].rankingListScores.push(value);
        games[name].rankingListAddressess.push(msg.sender);
    }

    function setRewardedNFT(string memory name, uint nftId) public onlyOwner {
        require(games[name].isExist == true, "Error (storeScore): game not found");
        games[name].rewardedNftId = nftId;
    }

    function setRewardedNFTAddress(string memory name, address nftAddress) public onlyOwner {
        require(games[name].isExist == true, "Error (storeScore): game not found");
        games[name].rewardedNftAddress = nftAddress;
    }

    function resetHighScore(string memory name) public onlyOwner {
        require(games[name].isExist == true, "Error (storeScore): game not found");
        games[name].rankingListScores = new uint[](0);
        games[name].rankingListAddressess = new address[](0);
    }
    
    function getHighValue(uint[] memory values) pure internal returns (uint) {
        uint i = 0;
        uint high = 0;
        
        for(i = 0; i < values.length; i++) {
            if (values[i] > high) {
                high = values[i];
            }
        }
        return high;
    }
    
    function withdrawNft(uint nftType, address nftContractAddress, uint nftId) public onlyOwner {
        // 1 -> ERC721
        // 2 -> ERC1155
        if (nftType == 1) {
            ERC721(nftContractAddress).safeTransferFrom(address(this), msg.sender, nftId);
        } else {
            ERC1155(nftContractAddress).safeTransferFrom(address(this), msg.sender, nftId, 1, "0x0");
        }
    }

    function addGame(string memory name, uint rewardedNftType, address rewardedNftAddress, uint rewardedNftId) public onlyOwner {
        NFTGame memory game = NFTGame({
            name: name,
            rankingListAddressess: new address[](0),
            rankingListScores: new uint[](0),
            rewardedNftType: rewardedNftType,
            rewardedNftAddress: rewardedNftAddress,
            rewardedNftId: rewardedNftId,
            isExist: true
        });
        
        games[name] = game;
    }
    
    
}
