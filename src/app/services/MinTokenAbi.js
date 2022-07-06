// The minimum ABI required to get the ERC20 Token balance
export const MinTokenAbi = [
   // balanceOf
   {
       constant: true,
       inputs: [{name: "_owner", type: "address"}],
       name: "balanceOf",
       outputs: [{name: "balance", type: "uint256"}],
       type: "function",
   },
   {
       "inputs": [
           {
               "internalType": "address",
               "name": "spender",
               "type": "address"
           },
           {
               "internalType": "uint256",
               "name": "value",
               "type": "uint256"
           }
       ],
       "name": "approve",
       "outputs": [
           {
               "internalType": "bool",
               "name": "",
               "type": "bool"
           }
       ],
       "stateMutability": "nonpayable",
       "type": "function"
   },
   {
       "constant": true,
       "inputs": [{"internalType": "address", "name": "", "type": "address"}, {
           "internalType": "address",
           "name": "",
           "type": "address"
       }],
       "name": "allowance",
       "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
       "payable": false,
       "stateMutability": "view",
       "type": "function"
   }
];