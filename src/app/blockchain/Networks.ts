export enum NetworkEnum {
  MAINET = 'mainnet',
  TESTNET = 'testnet',
}

export const networks = (network: NetworkEnum) => {
  switch (network) {
    case NetworkEnum.MAINET:
      return ProdNetworks;
    case NetworkEnum.TESTNET:
      return DevNetworks;
  }
};

const DevNetworks = [
  {
    index: 0,
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
    name: 'BSC Mainnet',
    contractNetworkName: 'bsc',
    routerAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    factoryAddress: '0xB7926C0430Afb07AA7DEfDE6DA862aE0Bde767bc',
    tokenCreatorContractAddress: '0xA0491C9b26FdB26C4113C219Fa3B74cEA83d0D95',
    lockLiquidityContractAddress: '0xa6068193d14Ef2c97276A6d001564C956e17a54c',
    busdContractAddress: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    launchpadContractAddress: '0x4798f9D67D0fA3BB4A8b8227A7C8B5792fd9D6e9',
    verifyApiUrl: 'https://api.bscscan.com/api',
    explorerApiKey: 'WRIX7WTH7VQ9MT3RNZARAMNPXYP4SNDPP4',
    chainIdInt: 56,
    params: {
      chainId: '0x38',
      chainName: 'Binance Smart Chain Mainnet',
      nativeCurrency: {
        name: 'Binance Coin',
        symbol: 'BNB',
        decimals: 18,
      },
      rpcUrls: ['https://bsc-dataseed.binance.org/'],
      blockExplorerUrls: ['https://bscscan.com'],
    },
    acceptedPaymentTokens: [
      {
        symbol: 'BNB',
        image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
        address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      },
      {
        symbol: 'BUSD',
        image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png',
        address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      }
    ],
  },
  {
    index: 1,
    name: 'Avalanche Mainnet',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png',
    routerAddress: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
    factoryAddress: '0xB7926C0430Afb07AA7DEfDE6DA862aE0Bde767bc',
    busdContractAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    contractNetworkName: 'avalanche',
    tokenCreatorContractAddress: '0x068EA823Ba0bF6FCA472B45Ab000DF42F76140Df',
    verifyApiUrl: 'https://api-testnet.snowtrace.io/api',
    explorerApiKey: 'ZGR21YGDGQSIVXI5B2NR5K73MFCDI4QPH8',
    chainIdInt: 43114,
    params: {
      chainId: '0xa86a',
      chainName: 'AVAX',
      nativeCurrency: {
        name: 'Avalanche',
        symbol: 'AVAX',
        decimals: 18
      },
      rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
      blockExplorerUrls: ['https://snowtrace.io/']
    },
    acceptedPaymentTokens: [
      {
        symbol: 'AVAX',
        image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
        address: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
      },
      {
        symbol: "USDC",
        image: 'https://bscscan.com/token/images/centre-usdc_28.png',
        address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"
      }
    ],
  },
  {
    index: 2,
    name: "Fantom Opera",
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3513.png',
    routerAddress: '0xF491e7B69E4244ad4002BC14e878a34207E38c29',
    factoryAddress: '0xB7926C0430Afb07AA7DEfDE6DA862aE0Bde767bc',
    tokenCreatorContractAddress: '0xA90654767d1f00a306A54aA6Fc37B5b5dD781B8e',
    busdContractAddress: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
    contractNetworkName: 'fantom',
    verifyApiUrl: 'https://api.ftmscan.com/api',
    explorerApiKey: 'RJ1FWEI6PVZPHQ33V6BD7W7QHE9ZMA5MHP',
    chainIdInt: 250,
    params: {
      chainId: '0xFA',
      chainName: 'Fantom',
      nativeCurrency: {
        name: 'Fantom',
        symbol: 'FTM',
        decimals: 18
      },
      rpcUrls: ['https://rpc.ftm.tools'],
      blockExplorerUrls: ['https://ftmscan.com']
    },
    acceptedPaymentTokens: [
      {
        symbol: "FTM",
        image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
        address: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"
      },
      {
        symbol: "USDC",
        image: 'https://bscscan.com/token/images/centre-usdc_28.png',
        address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75"
      }
    ]
  },
  {
    index: 3,
    name: 'Polygon Mainnet',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png',
    routerAddress: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
    factoryAddress: '0x5757371414417b8c6caad45baef941abc7d3ab32',
    tokenCreatorContractAddress: '0xA90654767d1f00a306A54aA6Fc37B5b5dD781B8e',
    lockLiquidityContractAddress: '0x118cbB6BFAe71E4Fe10d5f83429C439281dA319b',
    busdContractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    explorerApiKey: 'C88WPK1DEGCHQRS74BNNR78QV7ZDRBRRS9',
    verifyApiUrl: 'https://api.polygonscan.com/api',
    contractNetworkName: 'polygon',
    chainIdInt: 137,
    params: {
      network_id: '0x89',
      chainId: '0x89',
      chainName: 'Polygon (MATIC)',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      rpcUrls: ['https://polygon-rpc.com/'],
      blockExplorerUrls: ['https://explorer.matic.network/'],
    },
    acceptedPaymentTokens: [
      {
        symbol: 'MATIC',
        image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png',
        address: '0x0000000000000000000000000000000000001010',
      },
      {
        symbol: 'USDT',
        image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
        address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      }
    ],
  },
  
  {
    index: 4,
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
    name: 'BSC Testnet',
    contractNetworkName: 'bsc',
    routerAddress: '0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3',
    factoryAddress: '0xB7926C0430Afb07AA7DEfDE6DA862aE0Bde767bc',
    tokenCreatorContractAddress: '0x0f298426dEFEa979617eCd9DA9C48AA57Ec34993',
    lockLiquidityContractAddress: '0xa6068193d14Ef2c97276A6d001564C956e17a54c',
    busdContractAddress: '0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7',
    launchpadContractAddress: '0x4798f9D67D0fA3BB4A8b8227A7C8B5792fd9D6e9',
    verifyApiUrl: 'https://api-testnet.bscscan.com/api',
    explorerApiKey: 'V28HJCGUP2XCHSV5IXXG6IK9W14HHXKDCY',
    chainIdInt: 97,
    params: {
      chainId: '0x61',
      chainName: 'Binance Smart Chain Testnet',
      nativeCurrency: {
        name: 'Binance Coin',
        symbol: 'tBNB',
        decimals: 18,
      },
      rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
      blockExplorerUrls: ['https://testnet.bscscan.com'],
    },
    acceptedPaymentTokens: [
      {
        symbol: 'BNB',
        image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
        address: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
      },
      {
        symbol: 'BUSD',
        image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png',
        address: '0x78867bbeef44f2326bf8ddd1941a4439382ef2a7',
      }
    ],
  },
  {
    index: 5,
    name: 'Avalanche Fuji',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png',
    routerAddress: '0xc9c6f026e489e0a8895f67906ef1627f1e56860d',
    factoryAddress: '0xE4A575550C2b460d2307b82dCd7aFe84AD1484dd',
    busdContractAddress: '0xb9C31Ea1D475c25E58a1bE1a46221db55E5A7C6e',
    contractNetworkName: 'avalanche',
    tokenCreatorContractAddress: '0x068EA823Ba0bF6FCA472B45Ab000DF42F76140Df',
    verifyApiUrl: 'https://api-testnet.snowtrace.io/api',
    explorerApiKey: 'ZGR21YGDGQSIVXI5B2NR5K73MFCDI4QPH8',
    chainIdInt: 43113,
    params: {
      chainId: '0xa869',
      chainName: 'Avalanche Fuji',
      nativeCurrency: {
        name: 'Avalanche',
        symbol: 'AVAX',
        decimals: 18,
      },
      rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
      blockExplorerUrls: ['https://testnet.snowtrace.io'],
    },
    acceptedPaymentTokens: [
      {
        symbol: 'AVAX',
        image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
        address: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c',
      }
    ],
  },
  {
    index: 6,
    name: "Fantom Testnet",
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3513.png',
    routerAddress: '0xa6AD18C2aC47803E193F75c3677b14BF19B94883',
    factoryAddress: '0xEE4bC42157cf65291Ba2FE839AE127e3Cc76f741',
    busdContractAddress: '0xD366D4faC0cac082F266AE6962C2C298497b6f5D',
    tokenCreatorContractAddress: '0x823da4fF0350052B03A533d2974A5B31fE152Da8',
    contractNetworkName: 'fantom',
    verifyApiUrl: 'https://api-testnet.ftmscan.com/api',
    explorerApiKey: 'RJ1FWEI6PVZPHQ33V6BD7W7QHE9ZMA5MHP',
    chainIdInt: 4002,
    params: {
      chainId: '0xfa2',
      chainName: 'Fantom Testnet',
      nativeCurrency: {
        name: 'Fantom',
        symbol: 'FTM',
        decimals: 18
      },
      rpcUrls: ['https://rpc.testnet.fantom.network'],
      blockExplorerUrls: ['https://testnet.ftmscan.com']
    },
    acceptedPaymentTokens: [
      {
        symbol: "FTM",
        image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
        address: "0xf1277d1ed8ad466beddf92ef448a132661956621"
      },
      {
        symbol: "USDC",
        image: 'https://bscscan.com/token/images/centre-usdc_28.png',
        address: "0x04068da6c83afcfa0e13ba15a6696662335d5b75"
      }
    ]
  },
  {
    index: 7,
    name: 'Polygon Mumbai',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png',
    routerAddress: '0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff',
    factoryAddress: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
    busdContractAddress: '0x3813e82e6f7098b9583FC0F33a962D02018B6803',
    tokenCreatorContractAddress: '0xa3803892D2d111f0221c1AA2a387c6BD208EE0E6',
    contractNetworkName: 'polygon',
    verifyApiUrl: 'https://api-testnet.polygonscan.com/api',
    explorerApiKey: 'B8I1H8IDR9P2NNZVZMEYG5KVT55X44BNVT',
    chainIdInt: 80001,
    params: {
      chainId: '0x13881',
      chainName: 'Polygon Mumbai',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
      },
      rpcUrls: ['https://rpc-mainnet.maticvigil.com/'],
      blockExplorerUrls: ['https://polygonscan.com/']
    },
    acceptedPaymentTokens: [
      {
        symbol: "MATIC",
        image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png',
        address: "0x0000000000000000000000000000000000001010"
      },
      {
        symbol: "USDT",
        image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
        address: "0x3813e82e6f7098b9583FC0F33a962D02018B6803"
      }
    ]
  }
];

const ProdNetworks = []