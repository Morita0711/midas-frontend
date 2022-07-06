// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;
import "./Token.sol";

contract TokenCreator is Ownable {
  uint256 public creationTokenPrice = 10000000000000000;
  IUniswapV2Router02 public immutable pcsV2Router;
  address punk = 0x5A9A3cB7FBB13f1C5282057719e599C57e79d6E3;
  address nkt = 0xaa0a8F8b43124131099528c4a663AfB5789FEC66;

  constructor(address router) {
    pcsV2Router = IUniswapV2Router02(router);
  }

  function getEstimatedTokensForETH(address tokenAddress, uint ethAmount) public view returns (uint256) {
    return pcsV2Router.getAmountsIn(ethAmount, getPathForTokenETH(tokenAddress))[0];
  }

  function getPathForTokenETH(address tokenAddress) private view returns (address[] memory) {
    address[] memory path = new address[](2);
    path[0] = tokenAddress;
    path[1] = pcsV2Router.WETH();
    return path;
  }

  function createNewToken(
    address paymentTokenAddress,
    address tokenOwner,
    address payable _feeWallet,
    string memory tokenName,
    string memory tokenSymbol,
    uint256 amountOfTokenWei,
    uint8 decimal,
    uint8[] memory fees,
    address routerAddress
  ) public payable {

    if (msg.sender != owner()) {

      uint256 transferedAmount = 0;

      if (paymentTokenAddress != pcsV2Router.WETH()) {
        uint256 requiredTokenAmount = getEstimatedTokensForETH(paymentTokenAddress, creationTokenPrice);
        require(IERC20(address(paymentTokenAddress)).transferFrom(msg.sender, address(this), requiredTokenAmount));

        swapTokensForBNB(paymentTokenAddress, requiredTokenAmount);
        transferedAmount = address(this).balance;
      } else {
        require(msg.value >= creationTokenPrice, "low value");
        transferedAmount = msg.value;
      }
      payable(punk).transfer((50 * transferedAmount) / 100 );
      payable(nkt).transfer((50 * transferedAmount) / 100 );
    }

    new Token(tokenOwner, tokenName, tokenSymbol, decimal, amountOfTokenWei, fees[5], fees[6], _feeWallet, routerAddress).setAllFeePercent(fees[0],fees[1],fees[2],fees[3],fees[4]);
  }

  function updateCreatePrice(uint256 amount) public onlyOwner {
    creationTokenPrice = amount;
  }

  function swapTokensForBNB(address tokenAddress, uint256 tokenAmount) private {
    address[] memory path = new address[](2);

    path[0] = tokenAddress;
    path[1] = pcsV2Router.WETH();

    IERC20(tokenAddress).approve(address(pcsV2Router), tokenAmount);

    pcsV2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
      tokenAmount,
      0, // accept any amount of ETH
      path,
      address(this),
      block.timestamp
    );
  }
  fallback() external payable {}
  receive() external payable {}
}
