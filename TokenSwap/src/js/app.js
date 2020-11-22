App = {

    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 0,


    // init app
    init: async function () {
        console.log("App initialized...")
        return await App.initWeb3();
    },

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
        return App.initContract();
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
                return App.render();
            })
        });
    },

    // acts as function that renders the entire app
    render: function () {
        if (App.loading) {
            return;
        }
        App.loading = true;

        var loader = $('#loader');
        var content = $('#content');

        loader.show();
        content.hide();

        // Load account data (account that is currently used e.g. on MetaMask)
        web3.eth.getAccounts(function (err, account) {
            if (err) {
                console.log(err);
            } else {
                // for test purposes only
                console.log("account", account[0]);
                App.account = account;
                // quering for the account address on the DOM
                $('#accountAddress').html("Your Account: " + account);
            }
        })
        // display total token supply on the whole network
        App.contracts.TokenSwapCoin.deployed().then(function (instance) {
            TokenSwapCoinInstance = instance;
            return TokenSwapCoinInstance.totalSupply();
        }).then(function (totalSupply) {
            App.totalSupply = totalSupply;
            $('#token-totalSupply').html(App.totalSupply.toNumber());
            return TokenSwapCoinInstance.address;
        }).then(function (tokenContractAddress) {
            App.tokenContractAddress = tokenContractAddress;
            $('#tokenContractAddress').html("Token Contract Address on the Network (Token): " +
                App.tokenContractAddress);
            return TokenSwapCoinInstance.symbol();
        }).then(function (symbol) {
            //$('#token-balance').html("You currently have " + balance.toNumber() + " Token");
            $('.token-symbol').html(symbol);
            return TokenSwapCoinInstance.balanceOf(App.account);
        })
            .then(function (balance) {
                //$('#token-balance').html("You currently have " + balance.toNumber() + " Token");
                $('#token-balance').html(balance.toNumber());
                console.log(balance.toNumber());
                // show everything at the end of promise chain (when everything else was done successfully)
                App.loading = false;
                loader.hide();
                content.show();
            })
    },

    /*
        approveContract: function() {
            App.contracts.HashedTimelockERC20.deployed().then(function (instance) {
                HashedTimelockERC20Instance = instance;
                return HashedTimelockERC20Instance.address;
            }).then(function (address) {
                App.contracts.TokenSwapCoin.deployed().then(function (instance) {
                    TokenSwapCoinInstance = instance;
                    return TokenSwapCoinInstance.approve(address, 10000, {from: App.account});
                })
            })
        },*/


    //FIXME
    approveContract: function () {
        App.contracts.TokenSwapCoin.deployed().then(function (instance) {
            TokenSwapCoinInstance = instance;
            return web3.eth.getAccounts()
        }).then(function(address) {
            console.log(address);
        })

        /*App.contracts.TokenSwapCoin.deployed().then(function (instance) {
            TokenSwapCoinInstance = instance;

                    // Send ERC20 transaction with web3
                    /*return TokenSwapCoinInstance.transfer(accounts[1], 10000,
                        {from: accounts[0]}, function (error, txnHash) {
                        if (error) throw error;
                        console.log(txnHash);
                    }
                    );
                } */
    },



    //FIXME
    // setSwap function that will be triggered as soon as submit button ("Swap Tokens") is triggered
    setSwap: function () {
        var content = $('#content');
        content.hide();

        // get all variables needed for htlc from the html form
        var receiverAddress = $('#receiverAddress').val();
        var hashlock = $('#hashlock').val();
        var timelock = $('#timelock').val();
        var tokenAmount = $('#numberOfToken').val();

        App.contracts.TokenSwapCoin.deployed().then(function (instance) {
            TokenSwapCoinInstance = instance;
            return TokenSwapCoinInstance.address;
        }).then(function (address) {
            var tokenAddress = address;
        })//TODO idea: turn everything into one promise chain (both contract deployments), so tokenAddress is usable
         .then(function () {
        })



        // init swap
        App.contracts.HashedTimelockERC20.deployed().then(function (instance) {
            HashedTimelockERC20Instance = instance;
            return HashedTimelockERC20Instance.setSwap(
                receiverAddress,
                tokenAddress,
                hashlock,
                timelock,
                tokenAmount
                , { // metadata
                    from: App.account,
                    // default value
                    gas: 5000000
                }).then(function (result) {
                console.log("Swap succesfully set");
                $('form').trigger('reset'); // reset values in form
                content.show();
            });
        })
    },

    // testing purposes only
    print: function () {
        App.contracts.TokenSwapCoin.deployed().then(function (instance) {
            TokenSwapCoinInstance = instance;
            return TokenSwapCoinInstance.totalSupply();
        }).then(function(result) {
            console.log(result.toNumber());
        })
        //console.log("That worked");
    },

}



// whenever window loads, initialize app
$(function () {
    $(window).load(function () {
        App.init();
    })
});

