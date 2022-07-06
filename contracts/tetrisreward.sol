// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TetrisGame is Ownable, IERC721Receiver, ERC165, ERC721Holder {
    uint[] public games;
    mapping(uint => uint) public highScores;
    mapping(uint => uint) public lockTimes;
    mapping(uint => uint) public lastClaimDates;
    mapping(uint => uint) public rewardedNftIds;
    mapping(uint => address) public highScoreAddresses;
    mapping(uint => address) public nftAddresses;
    
    constructor() {

    }

    function onERC721Received(address, address, uint256, bytes memory) public virtual override(ERC721Holder, IERC721Receiver) returns (bytes4) {
        return this.onERC721Received.selector;
    }
    
    function getHighScoreAddresses(uint gameId) public view returns (address) {
        return highScoreAddresses[gameId];
    }
    
    function getHighScore(uint gameId) public view returns (uint256) {
        return highScores[gameId];
    }
    
    function claimReward(uint gameId) public payable {
        
        require(checkPeriod(lastClaimDates[gameId], lockTimes[gameId]), "Error (claimReward): too early");
        require(msg.sender == highScoreAddresses[gameId], "Error (claimReward): caller dont have higher score");

        highScores[gameId] = 0;
        highScoreAddresses[gameId] = address(0);

        lastClaimDates[gameId] = block.timestamp;
        ERC721(address(nftAddresses[gameId])).safeTransferFrom(address(this), msg.sender, rewardedNftIds[gameId]);
    }
    
    function checkPeriod(uint start, uint daysAfter) internal view returns (bool){
        if (block.timestamp >= start + daysAfter) { 
            return true;
        }
        return false;
    }
    
    function storeScore(uint gameId, uint256 amount) public {
        if(amount > highScores[gameId]) {
            highScores[gameId] = amount;
            highScoreAddresses[gameId] = msg.sender;
        }
    }
    
    function setRewardedNFT(uint gameId, uint nftId) public onlyOwner {
        require(games[gameId] != 0, "Error (claimReward): game not found");
        rewardedNftIds[gameId] = nftId;
    }
    
    function setRewardedNFTAddress(uint gameId, address nftAddress) public onlyOwner {
        require(games[gameId] != 0, "Error (claimReward): game not found");
        nftAddresses[gameId] = nftAddress;
    }
    
    function setPeriod(uint gameId, uint256 lockTime) public onlyOwner {
        require(games[gameId] != 0, "Error (claimReward): game not found");
        lockTimes[gameId] = lockTime;
    }
    
    function resetHighScore(uint gameId) public onlyOwner {
        require(games[gameId] != 0, "Error (claimReward): game not found");
        highScores[gameId] = 0;
        highScoreAddresses[gameId] = address(0);
    }
    
    function addGame(uint gameId) public onlyOwner {
        games.push(gameId);
        highScores[gameId] = 0;
        highScoreAddresses[gameId] = address(0);
        lockTimes[gameId] = 0;
        lastClaimDates[gameId] = block.timestamp;
    }
}