App = {

    web3Provider: null,
    contracts: {},
    abi: {},


    // init app
    init: async function () {
        console.log("App initialized...")
        return await App.initWeb3();
    },

    // connect web3
    initWeb3: async function () {
        // Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);
        return App.accessContract();
    },

    // instantiate smart contract so web3 knows where to find it and
    // how it works => enables interacting with Ethereum via web3
    initContract: function () {
        $.getJSON('../build/contracts/HashedTimelockERC20.json', function (data) {
            // Get the necessary contract artifact file
            // (= information about contract, e.g. deployed address etc.)
            var HashedTimelockERC20Artifact = data;
            // instantiate truffle contract with TruffleContract()
            App.contracts.HashedTimelockERC20 = TruffleContract(HashedTimelockERC20Artifact);
            // set the web3 provider for the contract
            App.contracts.HashedTimelockERC20.setProvider(App.web3Provider);
            // deployment for testing
            App.contracts.HashedTimelockERC20.deployed().then(function (HashedTimelockERC20) {
                console.log("HashedTimelock contract address: ", HashedTimelockERC20.address);
            });
        }).done(function () {
            $.getJSON('../build/contracts/TokenSwapCoin.json', function (data) {
                var TokenSwapCoinArtifact = data;
                App.contracts.TokenSwapCoin = TruffleContract(TokenSwapCoinArtifact);
                App.contracts.TokenSwapCoin.setProvider(App.web3Provider);
                App.contracts.TokenSwapCoin.deployed().then(function (TokenSwapCoin) {
                    console.log("Token address: ", TokenSwapCoin.address);
                });
            })
        });
    },

    accessContract: function () {
        $.getJSON('../build/contracts/TokenSwapCoin.json', function (data) {
            var TokenSwapCoinArtifact = data;
            App.contracts.TokenSwapCoin = TruffleContract(TokenSwapCoinArtifact);
            App.contracts.TokenSwapCoin.setProvider(App.web3Provider);
            App.contracts.TokenSwapCoin.at("0x3ef96443Cc84f06d74E726B8bef9E63C4A60037c").then(function (TokenSwapCoin) {
                console.log("Token address: ", TokenSwapCoin.address);
                return TokenSwapCoin.balanceOf("0x7885c1BFE70624Cf6C83a784dE298AC53CA63CF5");
            }).then(function (balance) {
                console.log(balance.toNumber());
            })
        })
    },


}

// whenever window loads, initialize app
$(function () {
    $(window).load(function () {
        App.init();
    })
});

