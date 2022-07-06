// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

import "./Dex/interfaces/uniswap/IUniswapV2Factory.sol";
import "./Dex/interfaces/uniswap/IUniswapV2Pair.sol";
import "./Fortune/TykheFortuneDistributor.sol";
import "./Dex/interfaces/IMercuriusMultiNetworkRouter.sol";


contract Token is ERC20Upgradeable {


    Ratios public _ratios;
    Fees public _taxRates;

    // REFLECTION (DISTRIBUTION TO HOLDERS / SMART STAKING)
    uint256 private _max;
    uint256 private _tFeeTotal;
    uint16 private _previousTaxFee;
    address[] private _excluded;
    uint256 private constant MAX = type(uint256).max;
    uint256 internal _totalSupply;
    uint256 private _reflectionSupply;
    mapping(address => uint256) internal _reflectionBalance;
    mapping(address => uint256) internal _tokenBalance;

    // --------------------------------------------------

    bool private gasLimitActive; // used for enable / disable max gas price limit
    uint256 private maxGasPriceLimit; // for store max gas price value
    mapping(address => uint256) private _holderLastTransferTimestamp; // to hold last Transfers temporarily  // todo remove
    bool public transferDelayEnabled; // for enable / disable delay between transactions
    uint256 private initialDelayTime; // to store the block in which the trading was enabled

    // event for show burn txs
    event Bun(address indexed sender, uint256 amount);

    string private _name;
    string private _symbol;
    uint8 private _decimals;
    address private _owner;
    mapping(address => mapping(address => uint256)) private _allowances;
    mapping(address => bool) internal _isFeeExcluded; // todo
    mapping(address => bool) internal lpPairs; // used for allow owner to add liquidity in diferents tokens
    event TransferedToPool(address, uint256);

    address internal contractAddress;

    IMercuriusMultiNetworkRouter public mercuriusMultiNetworkRouter;
    address public lpPair;
    address public deadAddress;
    address payable public busdForLiquidityAddress;
    address payable public busdBuymercuriusMultiNetworkRouterAddress;
    address payable public busdReserveAddress;
    uint256 public swapThreshold;
    bool internal inSwap;
    bool public tradingActive;
    address public busdAddress;
    mapping(address => bool) private _liquidityRatioHolders;
    uint256 internal maxBuyLimit;
    uint256 public timeDelayBetweenTx;
    uint256 internal totalDelayTime;

    // modifier for know when tx is swaping
    modifier swapping() {
        inSwap = true;
        _;
        inSwap = false;
    }

    modifier onlyOwner() {
        require(_owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event ContractSwapEnabledUpdated(bool enabled);

    /// @notice initialize upgradable contract
    function initialize(string memory _cname, string memory _csymbol) public initializer {
        __ERC20_init(_cname, _csymbol);

        _owner = msg.sender;
        _name = _cname;
        _symbol = _csymbol;
        _decimals = 18;
        _mint(msg.sender, 1 * 1e9 * 1e18);

        TykheProfitDistributor = new TykheProfitDistributor();

        _tFeeTotal;
        _previousTaxFee = 0;
        // used for temporaly store previous fee

        gasLimitActive = false;
        // used enable or disable max gas price limit
        maxGasPriceLimit = 15000000000;
        // used for store max gas price limit value
        transferDelayEnabled = false;
        // used for enable / disable delay between transactions
        // when the token reaches a set price, liquidity is automatically injected.

        swapThreshold = 500 ether;
        // token balance on contract needed for do swap
        tradingActive = false;
        // enable / disable transfer to wallets when contract do swap tokens for busd
        timeDelayBetweenTx = 5;
        totalDelayTime = 3600;

        deadAddress = 0x000000000000000000000000000000000000dEaD;

        // set busd, router, liquidity reserve and buy and burn reserve addresses
        address[] memory addresses = new address[](9);
        addresses[0] = 0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7;
        // busd
        addresses[1] = 0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3;
        // router
        addresses[2] = 0xe24a7ECA6fDf71EF057bd77a1EF8B21A5ae8A1E6;
        // Marketing
        addresses[3] = 0x7AF13ceEcF3Cd06ebE0A305fb2994cba21A30B65;



        TykheProfitDistributor.setExcludedFromFee(_owner, true);
        TykheProfitDistributor.setExcludedFromFee(address(this), true);
     

        _exclude(_owner);
        _exclude(address(this));
        _exclude(deadAddress);



        maxBuyLimit = 10000 ether;
        // 10000 TOKENS

        // set fees values
        _taxRates = Fees({
        distributionToHoldersFee : 50, // 0.5%
        liquidityFee : 100, // 1.0%
        buyBackFee : 100, // 1.0%
        busdReserveFee : 50             // 0.5%
        });

        // set ration values
        _ratios = Ratios({
        liquidityRatio : 100, // 1%
        buymercuriusMultiNetworkRouterRatio : 100, // 1%
        busdReserveRatio : 50, // 0.5%
        total : 250           // 2.5%
        });

        // constructor -------------------------------------

        // set busd address
        busdAddress = address(addresses[0]);

        // give permissions to the router to spend tokens and busd of the contract and owner
        _approve(msg.sender, busdAddress, type(uint256).max);
        _approve(address(this), busdAddress, type(uint256).max);
        _approve(msg.sender, addresses[1], type(uint256).max);
        _approve(address(this), addresses[1], type(uint256).max);

        // initialize router and create lp pair
        IMercuriusMultiNetworkRouter _uniswapV2Router = IMercuriusMultiNetworkRouter(addresses[1]);
        mercuriusMultiNetworkRouter = _uniswapV2Router;

        // wallets used to hold BUSD until liquidity is added/tokens are repurchased for burning.
        setLiquidityAddress(addresses[5]);
        setBusdBuymercuriusMultiNetworkRouterAddress(addresses[8]);
        setBusdReserveAddress(_owner);

        //createPair();
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /** 
     * @dev Creates `amount` tokens and assigns them to `account`, increasing
     * @notice Emits a {Transfer} event with `from` set to the zero address.
     *         the total supply.
     * Requirements:
     * - `account` cannot be the zero address.
     */
     
    function _mint(address account, uint256 amount) internal override virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, _totalSupply);
        _totalSupply = amount;
        _reflectionSupply = (MAX - (MAX % _totalSupply));
        _reflectionBalance[_owner] = _reflectionSupply;

        emit Transfer(address(0), account, _totalSupply);

        _afterTokenTransfer(address(0), account, _totalSupply);
    }
    

    // ====================================================== //
    //                      FALLBACKS                         //
    // ====================================================== //
    receive() external payable {}

    // ====================================================== //
    //                      ONLY V3                           //
    // ====================================================== //

    /// @notice Function inherited from BEP20 and overrided
    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        _transfer(sender, recipient, amount);
        require(_allowances[sender][msg.sender] >= amount, "ERC20: transfer amount exceeds allowance");
        _approve(sender, msg.sender, _allowances[sender][msg.sender] - amount);
        return true;
    }

    function getContractAddress() public view returns (address) {
        return address(this);
    }

    /**
     * @dev This method set address of liquidity pair that was created previously
     * @param add1 Address to assign the liquidity pair
     */
    function setPairAddress(address add1) public onlyOwner() {
        lpPair = add1;
        lpPairs[lpPair] = true;
        //_exclude(add1);
    }

    /**
     * @dev Update the max amount of tokens that can be buyed in one transaction
     * @param newVal New max buy limit in wei
     */
    function updateMaxBuyLimit(uint256 newVal) public onlyOwner() {
        maxBuyLimit = newVal;
    }

    /**
     * @dev Update the max gas limit that can be used in the transaction
     * @param newVal New gas limit amount
     */
    function updateGasLimitActive(bool newVal) public onlyOwner() {
        gasLimitActive = newVal;
    }

    // ====================================================== //
    //                       EXTERNAL                         //
    // ====================================================== //

    /**
     * @dev This method is used to change the taxes that affect the transfer from/to liquidity
     * @param distributionToHoldersFee Amount in basis point (1/100)
     * @param liquidityFee Amount in basis point (1/100)
     * @param buyBackFee Amount in basis point (1/100)
     * @param busdReserveFee Amount in basis point (1/100)
     */
    function setTaxes(uint16 distributionToHoldersFee, uint16 liquidityFee, uint16 buyBackFee, uint16 busdReserveFee) external onlyOwner {
        // check each individual fee is not higher than 3%
        require(distributionToHoldersFee <= 300, "distributionToHoldersFee EXCEEDED 3%");
        require(liquidityFee <= 300, "liquidityFee EXCEEDED 3%");
        require(buyBackFee <= 300, "distributionToHoldersFee EXCEEDED 3%");
        require(busdReserveFee <= 300, "distributionToHoldersFee EXCEEDED 3%");

        // set values
        _taxRates.distributionToHoldersFee = distributionToHoldersFee;
        _taxRates.liquidityFee = liquidityFee;
        _taxRates.buyBackFee = buyBackFee;
        _taxRates.busdReserveFee = busdReserveFee;
    }

    /// @notice Function inherited from BEP20
    function transferOwner(address newOwner) external onlyOwner {
        _isFeeExcluded[_owner] = false;
        _isFeeExcluded[newOwner] = true;
        _owner = newOwner;
        emit OwnershipTransferred(_owner, newOwner);
    }

    /// @notice Set different liquidity pair and update the state
    function setLpPair(address pair, bool newValue) external onlyOwner {
        if (newValue = false) {
            lpPairs[pair] = false;
        } else {
            lpPairs[pair] = true;
        }
    }

    /**
     * @notice This function is updating the value of the variable transferDelayEnabled
     * @param newVal New value of the variable
     */
    function updateTransferDelayEnabled(bool newVal) external onlyOwner {
        transferDelayEnabled = newVal;
    }


    /**
     * @notice This function is updating the value of the variable busdAddress
     * @param newAddress New value of the variable
     */
    function updateBUSDAddress(address newAddress) external onlyOwner {
        busdAddress = address(newAddress);
    }


    // ====================================================== //
    //                        PUBLIC                          //
    // ====================================================== //

    /// @notice Function inherited from BEP20
    function owner() public view returns (address) {return _owner;}

    function totalSupply() public view virtual override returns (uint256) {return _totalSupply - balanceOf(address(deadAddress));}

    /// @notice Function inherited from BEP20
    function decimals() public view virtual override returns (uint8) {return _decimals;}

    /// @notice Function inherited from BEP20
    function symbol() public view virtual override returns (string memory) {return _symbol;}

    /// @notice Function inherited from BEP20
    function name() public view virtual override returns (string memory) {return _name;}

    /// @notice Function inherited from BEP20
    function balanceOf(address account) public view override returns (uint256) {
        if (TykheProfitDistributor.isExcludedFromRewards(account)) return _tokenBalance[account];
        return tokenFromReflection(_reflectionBalance[account]);
    }

    /// @notice Function inherited from BEP20
    function allowance(address tokenOwner, address spender) public view virtual override returns (uint256) {return _allowances[tokenOwner][spender];}

    /// @notice Function inherited from BEP20
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /// @notice Function inherited from BEP20
    function _approve(
        address tokenOwner,
        address spender,
        uint256 amount
    ) internal override virtual {
        require(tokenOwner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[tokenOwner][spender] = amount;
        emit Approval(tokenOwner, spender, amount);
    }

    /// @notice Function inherited from BEP20 and overrided
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    /// @notice Function inherited from BEP20
    function getOwner() external view returns (address) {
        return owner();
    }

    /**
     * @notice Check if the address if excluded from rewards
     * @param account Address to be checked
     */
    function isExcludedFromReward(address account) public view returns (bool) {
        return TykheProfitDistributor.isExcludedFromRewards(account);
    }



    /**
     * @notice Set the liquidity address
     * @dev only called on initializer
     * @param _busdForLiquidityAddress Address of the BUSD Reserve
     */
    function setLiquidityAddress(address _busdForLiquidityAddress) public onlyOwner {
        busdForLiquidityAddress = payable(_busdForLiquidityAddress);
    }

    /**
     * @notice Set the address of the BuymercuriusMultiNetworkRouter Reserve
     * @param _busdBuymercuriusMultiNetworkRouterAddress Address of the BuymercuriusMultiNetworkRouter Reserve
     */
    function setBusdBuymercuriusMultiNetworkRouterAddress(address _busdBuymercuriusMultiNetworkRouterAddress) public onlyOwner {
        busdBuymercuriusMultiNetworkRouterAddress = payable(_busdBuymercuriusMultiNetworkRouterAddress);
    }

    /**
     * @notice Set the address of the BUSD Reserve
     * @param _busdReserveAddress Address of the BUSD Reserve
     */
    function setBusdReserveAddress(address _busdReserveAddress) public onlyOwner {
        busdReserveAddress = payable(_busdReserveAddress);
    }

    /**
     * @notice Set the block delay between txs
     * @param time Time in seconds
     */
    function setTimeDelayBetweenTx(uint256 time) public onlyOwner {
        timeDelayBetweenTx = time;
    }

    /**
     * @notice Set the total block delay between txs
     * @param time Time in seconds
     */
    function setTotalDelayTime(uint256 time) public onlyOwner {
        totalDelayTime = time;
    }

    // ====================================================== //
    //                PUBLIC EXPERIMENTAL                     //
    // ====================================================== //

    /**
     * @dev Enable trading (swap) and set initial block 
     */
    function enableTrading() public onlyOwner {
        require(!tradingActive, "Trading already enabled!");
        tradingActive = true;
        initialDelayTime = block.timestamp;
    }

    // todo check excluded
    // check rfi contract and check if is same or not
    // check if account is excluded from fees

    /** 
     * @dev Is excluded from fee transaction
     * @param account address
     * @return bool
     */
    function isFeeExcluded(address account) public view returns (bool) {
        return _isFeeExcluded[account];
    }

    /**
     * @dev set router address and busd on this router
     * @param newRouter address of router
     * @param busd address of busd
     */
    function setNewRouter(address newRouter, address busd) public onlyOwner() {
        IMercuriusMultiNetworkRouter _newRouter = IMercuriusMultiNetworkRouter(newRouter);
        address getPair = IUniswapV2Factory(_newRouter.factory()).getPair(address(busd), address(this));

        // check if pair exist
        // if not exists, create pair, otherwise get pair address from factory contract
        if (getPair == address(0)) {
            lpPair = IUniswapV2Factory(_newRouter.factory()).createPair(address(busd), address(this));
        }
        else {
            lpPair = getPair;
        }

        // set lp address on automatic market maker list
        lpPairs[lpPair] = true;
        mercuriusMultiNetworkRouter = _newRouter;
        _approve(address(this), address(mercuriusMultiNetworkRouter), type(uint256).max);
    }

    function _hasLimits(address from, address to)
    private
    view
    returns (bool)
    {
        return
        from != _owner &&
        to != _owner &&
        tx.origin != _owner &&
        to != deadAddress &&
        to != address(0) &&
        from != address(this);
    }

    // ====================================================== //
    //                      INTERNAL                          //
    // ====================================================== //

    /**
     * @dev Transfer tokens from one address to another
     * @param from address The address which you want to send tokens from
     * @param to address The address which you want to transfer to
     * @param amount uint256 the amount of tokens to be transferred
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(amount != 0, "Transfer amount cannot be zero");

        if (_hasLimits(from, to)) {
            if (!tradingActive) {
                revert("Trading not yet enabled!");
            }
        }

        if (transferDelayEnabled && block.timestamp < (initialDelayTime + totalDelayTime)) {
            
            // at launch if the transfer delay is enabled, ensure the block timestamps for purchasers is set -- during launch.
            if (from != _owner && to != address(mercuriusMultiNetworkRouter) && to != address(lpPair)) {

                // in the first one hour, a maximum of XX BUSD purchase is adjustable (10000 BUSD is the default value)
                if (maxBuyLimit > 0) {
                    require(amount <= maxBuyLimit, "Max Buy Limit.");
                }

                // only use to prevent sniper buys in the first blocks.
                if (gasLimitActive) {
                    require(tx.gasprice <= maxGasPriceLimit, "Gas price exceeds limit.");
                }

                // delay between tx
                require(_holderLastTransferTimestamp[msg.sender] <= block.timestamp, "_transfer:: Transfer Delay enabled.");
                _holderLastTransferTimestamp[msg.sender] = block.timestamp + timeDelayBetweenTx;
            }
        }

        // ====================================================== //
        //                      INTERNAL                          //
        // ====================================================== //

        // if transaction are internal transfer when contract is swapping
        // transfer no fee
        if (inSwap) {
            _transferNoFee(from, to, amount);
            return;
        }

        // SWAP
        if (contractMustSwap(from, to)) {
            contractSwap();
        }

        bool takeFee = true;
        bool isTransfer = isTransferBetweenWallets(from, to);

        if (TykheProfitDistributor.isExcludedFromFee(from) || TykheProfitDistributor.isExcludedFromFee(to) && !lpPairs[from] || !lpPairs[to]) {
            takeFee = false;
        }

        /*
        if (_isExcludedFromFee[from] || _isExcludedFromFee[to) {
            takeFee = false;
        }
        */

        // Transfer between wallets have 0% fee
        // If takeFee is false there is 0% fee
        if (isTransfer || !takeFee) {
            _transferNoFee(from, to, amount);
            return;
        }

        _tokenTransfer(from, to, amount);
    }

    /**
     * @dev Handle if contract have to swap tokens
     * @param from address The address which you want to send tokens from
     * @param to address The address which you want to transfer to
     */
    function contractMustSwap(address from, address to) internal view returns (bool) {
        uint256 contractTokenBalance = balanceOf(contractAddress);
        return contractTokenBalance >= swapThreshold &&
        !inSwap &&
        from != lpPair &&
        balanceOf(lpPair) > 0 &&
        !TykheProfitDistributor.isExcludedFromFee(to) &&
        !TykheProfitDistributor.isExcludedFromFee(from);
    }

    /**
     * @dev Handle if transaction is between wallets and not from/to liquidity
     * @param from address The address which you want to send tokens from
     * @param to address The address which you want to transfer to
     */
    function isTransferBetweenWallets(address from, address to) internal view returns (bool) {
        return from != lpPair && to != lpPair;
    }

    /**
     * @dev This is the function that handles the actual transfer of tokens.
     * @param sender Address of the sender (from)
     * @param recipient Address of the recipient (to)
     * @param amount Amount of tokens to be transferred
     */
    function _tokenTransfer(address sender, address recipient, uint256 amount) private {

        if (TykheProfitDistributor.isExcludedFromRewards(sender) && !TykheProfitDistributor.isExcludedFromRewards(recipient)) {
            _transferFromExcluded(sender, recipient, amount);
        } else if (!TykheProfitDistributor.isExcludedFromRewards(sender) && TykheProfitDistributor.isExcludedFromRewards(recipient)) {
            _transferToExcluded(sender, recipient, amount);
        } else if (!TykheProfitDistributor.isExcludedFromRewards(sender) && !TykheProfitDistributor.isExcludedFromRewards(recipient)) {
            _transferStandard(sender, recipient, amount);
        } else if (TykheProfitDistributor.isExcludedFromRewards(sender) && TykheProfitDistributor.isExcludedFromRewards(recipient)) {
            _transferBothExcluded(sender, recipient, amount);
        } else {
            _transferStandard(sender, recipient, amount);
        }

    }

    /**
     * @dev Handle if sender is excluded from fees
     * @param sender address The address which you want to send tokens from
     * @param recipient address The address which you want to transfer to
     * @param amount uint256 The amount in wei of tokens to transfer
     */
    function _transferNoFee(address sender, address recipient, uint256 amount) private {

        uint256 currentRate = _getRate();
        uint256 rAmount = amount * currentRate;

        _reflectionBalance[sender] -= rAmount;
        _reflectionBalance[recipient] += rAmount;

        if (TykheProfitDistributor.isExcludedFromRewards(sender)) {
            _tokenBalance[sender] -= amount;
        }

        if (TykheProfitDistributor.isExcludedFromRewards(recipient)) {
            _tokenBalance[recipient] += amount;
        }
        emit Transfer(sender, recipient, amount);
    }

    /**
     * @notice This function is called when the _tokenTransfer function is called
     * @dev This function is used to distribute as proportional to the balance of each user
     */
    function _transferBothExcluded(address sender, address recipient, uint256 tAmount) private {
        FeeValues memory _values = _getValues(tAmount);
        _tokenBalance[sender] -= tAmount;
        _reflectionBalance[sender] -= _values.rAmount;
        _tokenBalance[recipient] += _values.tTransferAmount;
        _reflectionBalance[recipient] += _values.rTransferAmount;
        _takeFees(sender, _values);
        _reflectFee(_values.rFee, _values.tFee);
        emit Transfer(sender, recipient, _values.tTransferAmount);
    }

    /// @notice Transfer function that handle the standard transfer
    function _transferStandard(address sender, address recipient, uint256 tAmount) private {
        FeeValues memory _values = _getValues(tAmount);
        _reflectionBalance[sender] -= _values.rAmount;
        _reflectionBalance[recipient] += _values.rTransferAmount;
        _takeFees(sender, _values);
        _reflectFee(_values.rFee, _values.tFee);
        emit Transfer(sender, recipient, _values.tTransferAmount);
    }

    /// @notice Transfer function that handle transfer to a Excluded address
    function _transferToExcluded(address sender, address recipient, uint256 tAmount) private {
        FeeValues memory _values = _getValues(tAmount);
        _reflectionBalance[sender] -= _values.rAmount;
        _tokenBalance[recipient] += _values.tTransferAmount;
        _reflectionBalance[recipient] += _values.rTransferAmount;
        _takeFees(sender, _values);
        _reflectFee(_values.rFee, _values.tFee);
        emit Transfer(sender, recipient, _values.tTransferAmount);
    }

    /// @notice Transfer function that handle transfer from Excluded address
    function _transferFromExcluded(address sender, address recipient, uint256 tAmount) private {
        FeeValues memory _values = _getValues(tAmount);
        _tokenBalance[sender] = _tokenBalance[sender] - tAmount;
        _reflectionBalance[sender] = _reflectionBalance[sender] - _values.rAmount;
        _reflectionBalance[recipient] = _reflectionBalance[recipient] + _values.rTransferAmount;
        _takeFees(sender, _values);
        _reflectFee(_values.rFee, _values.tFee);
        emit Transfer(sender, recipient, _values.tTransferAmount);
    }

    /**
     * @notice This function is used to send the fees directly to the contractAddress
     * @dev This function use a handler that is _takeFee that calculates the amount sended from _takeFees
     * @param sender Address of the sender (from)
     * @param values The fee values of (tFee, tLiquidiy, tBuymercuriusMultiNetworkRouter, tReserve)
     */
    function _takeFees(address sender, FeeValues memory values) private {
        _takeFee(sender, values.tLiquidity + values.tBuymercuriusMultiNetworkRouter + values.tReserve, address(this));
    }

    /**
     * @notice This function is used to calculate the fee Amount
     * @param sender Address of the sender (from)
     * @param tAmount The amount of fee tokens to be transferred
     * @param recipient Address of the recipient (to)
     */
    function _takeFee(address sender, uint256 tAmount, address recipient) private {
        if (recipient == address(0)) return;
        if (tAmount == 0) return;

        uint256 currentRate = _getRate();
        uint256 rAmount = tAmount * currentRate;
        _reflectionBalance[recipient] += rAmount;
        if (TykheProfitDistributor.isExcludedFromRewards(recipient))
            _tokenBalance[recipient] += tAmount;

        emit Transfer(sender, recipient, tAmount);
    }

    /**
     * @notice This function is used to Update the Max Gas Price Limit for transactions
     * @dev This function is used inside the tokenTransfer during the first hour of the contract
     * @param newValue uint256 The new Max Gas Price Limit
     */
    function updateMaxGasPriceLimit(uint256 newValue) public onlyOwner {
        require(newValue >= 10000000000, "max gas price cant be lower than 10 gWei");
        maxGasPriceLimit = newValue;
    }

    /**
     * @dev This function is used to update the Swap Threshold limit amount
     * @param newThreshold uint256 The new Swap Threshold limit amount
     */
    function updateSwapThreshold(uint256 newThreshold) public onlyOwner {
        swapThreshold = newThreshold;
    }

    /**
     * @notice Used to swap the fees tokens for busd
     * @dev This function is a _transfer middleware that handles 
     *      the conversion of the fees that were retained in the contract. 
     *      It uses a threshold to exchange directly to the Management fees.
     */

     // NEW
    /*
    function contractSwap() internal swapping {
        uint256 numTokensToSwap = balanceOf(address(this));

        // cancel swap if fees are zero
        if (_ratios.total == 0) {
            return;
        }
        // check allowances // todo

        // swap tokens for busd and send to busd liquidity address
        address[] memory tokensBusdPath = getPathForTokensToTokens(address(this), busdAddress);
        _approve(address(this), address(mercuriusMultiNetworkRouter), numTokensToSwap);
        IERC20(busdAddress).approve(address(mercuriusMultiNetworkRouter), numTokensToSwap);

        // swap whole contract token balance and send to contract
        
        mercuriusMultiNetworkRouter.swapExactTokensForTokens(
            numTokensToSwap,
            0,
            tokensBusdPath,
            address(this),
            block.timestamp + 600
        );
    }
    */

    /*
        NEW 2

    */

    function contractSwap() internal swapping {

        uint256 numTokensToSwap = balanceOf(address(this));

        // cancel swap if fees are zero
        if (_ratios.total == 0) {
            return;
        }

      
        // swap
        //swapTokensForBUSD(numTokensToSwap);


       
        sendToPools();
        
    }

/*
        // OLD (WORKING)
    function contractSwap() internal swapping {
        uint256 numTokensToSwap = balanceOf(address(this));
        //numTokensToSwap = numTokensToSwap - ((numTokensToSwap * 5) / 100);

        // cancel swap if fees are zero
        if (_ratios.total == 0) {
            return;
        }

        // check allowances // todo
        if (_allowances[address(this)][address(mercuriusMultiNetworkRouter)] != type(uint256).max) {
            _allowances[address(this)][address(mercuriusMultiNetworkRouter)] = type(uint256).max;
        }

        // calculate percentage to bsud reserver and manual buyback and burn 
        uint256 tokensToliquidityAmount = (numTokensToSwap * _ratios.liquidityRatio) / (_ratios.total);
        uint256 tokensToBuymercuriusMultiNetworkRouterAmount = (numTokensToSwap * _ratios.buymercuriusMultiNetworkRouterRatio) / (_ratios.total);
        uint256 busdReserveAmount = (numTokensToSwap * _ratios.busdReserveRatio) / (_ratios.total);

        // swap tokens for busd and send to busd liquidity address
        if (tokensToliquidityAmount > 0) {

            address[] memory tokensBusdPath = getPathForTokensToTokens(address(this), busdAddress);
            _approve(address(this), address(mercuriusMultiNetworkRouter), numTokensToSwap);
            IERC20(busdAddress).approve(address(mercuriusMultiNetworkRouter), numTokensToSwap);

            mercuriusMultiNetworkRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                tokensToliquidityAmount,
                0,
                tokensBusdPath,
                busdForLiquidityAddress,
                block.timestamp + 600
            );
        }

        // swap tokens for busd and send to manual busd buyback and burn address 
        if (tokensToBuymercuriusMultiNetworkRouterAmount > 0) {

            address[] memory tokensBusdPath = getPathForTokensToTokens(address(this), busdAddress);

            _approve(address(this), address(mercuriusMultiNetworkRouter), numTokensToSwap);
            IERC20(busdAddress).approve(address(mercuriusMultiNetworkRouter), numTokensToSwap);

            mercuriusMultiNetworkRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                tokensToBuymercuriusMultiNetworkRouterAmount,
                0,
                tokensBusdPath,
                busdBuymercuriusMultiNetworkRouterAddress,
                block.timestamp + 600
            );
        }

        // swap tokens for busd and send to manual busd buyback and burn address 
        if (busdReserveAmount > 0) {

            address[] memory tokensBusdPath = getPathForTokensToTokens(address(this), busdAddress);
            _approve(address(this), address(mercuriusMultiNetworkRouter), numTokensToSwap);
            IERC20(busdAddress).approve(address(mercuriusMultiNetworkRouter), numTokensToSwap);

            mercuriusMultiNetworkRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                busdReserveAmount,
                0,
                tokensBusdPath,
                busdReserveAddress,
                block.timestamp + 600
            );
        }
    }
*/
/*
    /// @dev Swap tokens for AVAX
    function swapTokensForBUSD(uint256 tokenAmount) private {
        address[] memory tokensBusdPath = getPathForTokensToTokens(address(this), busdAddress);

        _approve(address(this), address(mercuriusMultiNetworkRouter), tokenAmount);
        IERC20(busdAddress).approve(address(mercuriusMultiNetworkRouter), tokenAmount);

        uint256 amountOutIn = mercuriusMultiNetworkRouter.getAmountsOut(
            tokenAmount,
            tokensBusdPath
        )[0];

        // make the swap
        mercuriusMultiNetworkRouter.swapExactTokensForTokens(
            tokenAmount,
            amountOutIn,
            tokensBusdPath,
            address(this),
            block.timestamp
        );
    }
    */

    function sendToPools() internal {
        IERC20 busd = IERC20(busdAddress);
        uint256 contractBusdBalance =  busd.balanceOf(address(this));
        
        // calculate percentage to bsud reserver and manual buyback and burn 
        uint256 busdTokensToliquidityAmount = (contractBusdBalance * _ratios.liquidityRatio) / (_ratios.total);
        uint256 busdTokensToBuymercuriusMultiNetworkRouterAmount = (contractBusdBalance * _ratios.buymercuriusMultiNetworkRouterRatio) / (_ratios.total);
        uint256 busdTokensbusdReserveAmount = (contractBusdBalance * _ratios.busdReserveRatio) / (_ratios.total);
        
        busd.transfer(busdForLiquidityAddress, busdTokensToliquidityAmount);
        busd.transfer(busdBuymercuriusMultiNetworkRouterAddress, busdTokensToBuymercuriusMultiNetworkRouterAmount);
        busd.transfer(busdReserveAddress, busdTokensbusdReserveAmount);
    }

    /**
     * @notice This function receives the reservations and returns them in an array
     * @return uint256[] - [busdReserve, tokenReserve]
     */

    function getReserves() public view returns (uint[] memory) {
        IUniswapV2Pair pair = IUniswapV2Pair(lpPair);
        (uint res0, uint res1,) = pair.getReserves();

        uint[] memory reserves = new uint[](2);
        reserves[0] = res0;
        reserves[1] = res1;

        return reserves;
    }

    function getTokenPrice(uint amount) public view returns (uint) {
        uint[] memory reserves = getReserves();
        uint res0 = reserves[0] * (10 ** _decimals);
        return ((amount * res0) / reserves[1]);
    }
    





    /**
     * @dev Function used to burn torkens
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public {
        require(amount >= 0, "mercuriusMultiNetworkRouter amount should be greater than zero");
        require(amount <= balanceOf(msg.sender), "mercuriusMultiNetworkRouter amount should be less than account balance");

        _burnNoFee(msg.sender, amount);
        //emit mercuriusMultiNetworkRouter(msg.sender, amount);
    }
    
    /**
     * @dev mercuriusMultiNetworkRouter tokens without fee, send to zero address and decreate total supply,
     *      emit a event mercuriusMultiNetworkRouter with two parameters `address` and `uint256`
     * @param sender Address of the sender (from)
     * @param amount uint256 The amount in wei of tokens to transfer
     * 
     */
    function _burnNoFee(address sender, uint256 amount) private {
        _transferNoFee(sender, deadAddress, amount);
    }

    // reflection -------------------------------------------------------------------------------------------

    /**
     * @dev This function is used to get the reflection amount
     * @param tAmount Amount of tokens to get reflection for
     */
    function reflectionFromToken(uint256 tAmount) public view returns (uint256) {
        require(tAmount <= _totalSupply, "Amount must be less than supply");
        FeeValues memory _values = _getValues(tAmount);
        return _values.rAmount;
    }

    /**
     * @dev Get the current rate for the given amount of tokens
     * @param rAmount Amount of tokens to get rate for
     */
    function tokenFromReflection(uint256 rAmount) internal view returns (uint256) {
        require(rAmount <= _reflectionSupply, "Amt must be less than tot refl");
        uint256 currentRate = _getRate();
        return rAmount / currentRate;
    }

    /**
     * @notice This function is used to grant access to the rewards
     *         again.
     * @dev Include address in the Reward List again
     * @param account Address of the account to add to the list
     */
    function includeInReward(address account) external onlyOwner() {
        require(TykheProfitDistributor.isExcludedFromRewards(account), "Account is not excluded");
        for (uint256 i = 0; i < _excluded.length; i++) {
            if (_excluded[i] == account) {
                _excluded[i] = _excluded[_excluded.length - 1];
                _tokenBalance[account] = 0;
                TykheProfitDistributor.setExcludedFromFee(account,false);
                _excluded.pop();
                break;
            }
        }
    }

    /**
     * @notice Exclude account from reward distribution and add to the
     *         excluded list
     * @param account Address of the account to exclude
     */
    function _exclude(address account) internal {
        if(_reflectionBalance[account] > 0) {
            _tokenBalance[account] = tokenFromReflection(_reflectionBalance[account]);
        }
        TykheProfitDistributor.setExcludedFromFee(account,false);
        _excluded.push(account);
    }

    /** 
     * @dev Substract rFee from rTotal and add tFee to tFeeTotal
     * @param rFee Amount of reflection to substract from rTotal
     * @param tFee Amount of tokens to add to tFeeTotal
     */
    function _reflectFee(uint256 rFee, uint256 tFee) private {
        _reflectionSupply -= rFee;
        _tFeeTotal += tFee;
    }

    /**
     * @notice Function to calculate the extra fees for the given amount of tokens
     * @dev This function uses too the functions `_getRValues` and `_getTValues`
     * @param tAmount Amount of tokens to get fees for
     */
    function _getValues(uint256 tAmount) private view returns (FeeValues memory) {
        tFeeValues memory tValues = _getTValues(tAmount);
        // add all extra fees
        uint256 tTransferFee = tValues.tLiquidity + tValues.tBuymercuriusMultiNetworkRouter + tValues.tReserve;
        (uint256 rAmount, uint256 rTransferAmount, uint256 rFee) = _getRValues(tAmount, tValues.tFee, tTransferFee, _getRate());

        return FeeValues(rAmount, rTransferAmount, rFee, tValues.tTransferAmount, tValues.tFee, tValues.tLiquidity, tValues.tBuymercuriusMultiNetworkRouter, tValues.tReserve);
    }

    /**
     * @notice Function to calculate the fees from a given inputs
     * @param tAmount Amount of tokens to get fees for
     * @param tFee Amount of tokens to get fees for
     * @param tTransferFee Amount of tokens to get fees for
     * @param currentRate Current rate of the token
     * @return uint256 Current rAmount multiplied by CurrentRate
     * @return uint256 Current rTransferAmount 
     * @return uint256 Current rFee multiplied by CurrentRate
     */
    function _getRValues(uint256 tAmount, uint256 tFee, uint256 tTransferFee, uint256 currentRate) private pure returns (uint256, uint256, uint256) {
        uint256 rAmount = tAmount * currentRate;
        uint256 rFee = tFee * currentRate;
        uint256 rTransferFee = tTransferFee * currentRate;
        uint256 rTransferAmount = rAmount - rFee - rTransferFee;
        return (rAmount, rTransferAmount, rFee);
    }

    /**
     * @notice Calculate the base fees from tFeeValues
     * @param tAmount Amount of tokens to get fees for
     * @return tFeeValues - tFeeValues with base fees
     */
    function _getTValues(uint256 tAmount) private view returns (tFeeValues memory) {

        tFeeValues memory tValues = tFeeValues(
            0,
            calculateFee(tAmount, _taxRates.distributionToHoldersFee),
            calculateFee(tAmount, _taxRates.liquidityFee),
            calculateFee(tAmount, _taxRates.buyBackFee),
            calculateFee(tAmount, _taxRates.busdReserveFee)
        );

        tValues.tTransferAmount = tAmount - tValues.tFee - tValues.tLiquidity - tValues.tBuymercuriusMultiNetworkRouter - tValues.tReserve;
        return tValues;
    }

    /**
     * @notice This function is used to calculate the base fees
     * @dev Calculate fee with the formula `amount * fee / (10 ** 4)`
     * @param _amount Amount of tokens to be calculated
     * @param _fee Fee to be used to calculate the fee
     * @return uint256 Fee calculated
     */
    function calculateFee(uint256 _amount, uint256 _fee) private pure returns (uint256) {
        if (_fee == 0) return 0;
        return _amount * _fee / 10 ** 4;
    }

    /**
     * @notice Get the actual rate of the token
     * @return uint256 Current rate of the token
     */
    function _getRate() private view returns (uint256) {
        (uint256 rSupply, uint256 tSupply) = _getCurrentSupply();
        return rSupply / tSupply;
    }

    /**
     * @notice Get the current supply of the token
     * @return uint256 Current rSupply
     * @return uint256 Current tSupply
     */
    function _getCurrentSupply() private view returns (uint256, uint256) {
        uint256 rSupply = _reflectionSupply;
        uint256 tSupply = _totalSupply;
        for (uint256 i = 0; i < _excluded.length; i++) {
            if (_reflectionBalance[_excluded[i]] > rSupply || _tokenBalance[_excluded[i]] > tSupply) return (_reflectionSupply, _totalSupply);
            rSupply = rSupply - _reflectionBalance[_excluded[i]];
            tSupply = tSupply - _tokenBalance[_excluded[i]];
        }
        if (rSupply < _reflectionSupply / _totalSupply) return (_reflectionSupply, _totalSupply);
        return (rSupply, tSupply);
    }

  
}
