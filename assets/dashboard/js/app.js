'use strict'
const Web3 = require('web3');
const privateKeyToAddress = require('ethereum-private-key-to-address');
const Buf = require('buffer').Buffer;
const Common = require('ethereumjs-common');
const fetch = require("node-fetch");
const fs = require('fs');

const fileReaderPullStream = require('pull-file-reader')
const request = require('request');

// Node
const $ethomessage = document.querySelector('.etho-message')
const $nodeId = document.querySelector('.node-id')
const $uploadMessage = document.querySelector('.upload-message')
const $analyzeMessage = document.querySelector('.analyze-message')
const $nodeAddresses = document.querySelector('.node-addresses')
const $logs = document.querySelector('#logs')
// Files
const $fetchButton = document.querySelector('#fetch-btn')
const $dragContainer = document.querySelector('#drag-container')
const $progressBar = document.querySelector('#progress-bar')
const $fileHistory = document.querySelector('#file-history tbody')
const $emptyRow = document.querySelector('.empty-row')
// Misc
const $allDisabledButtons = document.querySelectorAll('button:disabled')
const $allDisabledInputs = document.querySelectorAll('input:disabled')
const $allDisabledElements = document.querySelectorAll('.disabled')

let MainFileArray = [];
const FILES = []
var usedStorageArray = new Array();
var availableStorageArray = new Array();
var nodeCountArray = new Array();
var PeersForChannel = new Array();
let uploadCount = 0;
let fileSize = 0
process.env.LIBP2P_FORCE_PNET = 1
let addr
let messageFlag = 0;
let messageString = "";
let healthMessage = "";
let averageAvailableStorageTotal = 0;

/*SET CONTRACTS UP HERE*/
var GlobalChannelString = "ethoFSPinningChannel_alpha11";
var GlobalControllerContractAddress = "0xc38B47169950D8A28bC77a6Fa7467464f25ADAFc";
var GlobalControllerABI = JSON.parse('[ { "constant": true, "inputs": [], "name": "last_completed_migration", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address", "value": "0x" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": false, "inputs": [ { "name": "completed", "type": "uint256" } ], "name": "setCompleted", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "new_address", "type": "address" } ], "name": "upgrade", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "pinToAdd", "type": "string" }, { "name": "pinSize", "type": "uint32" } ], "name": "PinAdd", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "pin", "type": "string" } ], "name": "PinRemove", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": false, "inputs": [], "name": "deleteContract", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "set", "type": "address" } ], "name": "SetAccountCollectionAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "hostingCost", "type": "uint256" } ], "name": "SetHostingCost", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "pinStorageAddress", "type": "address" } ], "name": "SetPinStorageAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "ethoFSDashboardAddress", "type": "address" } ], "name": "SetEthoFSDashboardAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "ethoFSHostingContractsAddress", "type": "address" } ], "name": "SetEthoFSHostingContractsAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "AccountName", "type": "string" } ], "name": "AddNewUserOwner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "AccountName", "type": "string" } ], "name": "AddNewUserPublic", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "RemoveUserOwner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "RemoveUserPublic", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "MainContentHash", "type": "string" }, { "name": "HostingContractName", "type": "string" }, { "name": "HostingContractDuration", "type": "uint32" }, { "name": "TotalContractSize", "type": "uint32" }, { "name": "pinSize", "type": "uint32" }, { "name": "ContentHashString", "type": "string" }, { "name": "ContentPathString", "type": "string" } ], "name": "AddNewContract", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" }, { "name": "MainContentHash", "type": "string" } ], "name": "RemoveHostingContract", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" }, { "name": "HostingContractExtensionDuration", "type": "uint32" } ], "name": "ExtendContract", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [], "name": "ScrubHostingContracts", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountName", "outputs": [ { "name": "value", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountActiveContractCount", "outputs": [ { "name": "value", "type": "uint32", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountTotalContractCount", "outputs": [ { "name": "value", "type": "uint32", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "ArrayKey", "type": "uint256" } ], "name": "GetHostingContractAddress", "outputs": [ { "name": "value", "type": "address", "value": "0x" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "CheckAccountExistence", "outputs": [ { "name": "", "type": "bool", "value": false } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetMainContentHash", "outputs": [ { "name": "MainContentHash", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetContentHashString", "outputs": [ { "name": "ContentHashString", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetContentPathString", "outputs": [ { "name": "ContentPathString", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractDeployedBlockHeight", "outputs": [ { "name": "value", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractExpirationBlockHeight", "outputs": [ { "name": "value", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractStorageUsed", "outputs": [ { "name": "value", "type": "uint32", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractName", "outputs": [ { "name": "value", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "newOperator", "type": "address" } ], "name": "changeOperator", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "set", "type": "address" } ], "name": "SetAccountCollectionAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "AccountName", "type": "string" } ], "name": "AddNewUser", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "RemoveUser", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "newContractAddress", "type": "address" }, { "name": "UserAddress", "type": "address" }, { "name": "HostingContractName", "type": "string" }, { "name": "HostingContractDuration", "type": "uint32" }, { "name": "TotalContractSize", "type": "uint32" } ], "name": "AddHostingContract", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "HostingContractAddress", "type": "address" } ], "name": "RemoveHostingContract1", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountAddress", "outputs": [ { "name": "value", "type": "address" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountName", "outputs": [ { "name": "value", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountActiveContractCount", "outputs": [ { "name": "value", "type": "uint32" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountTotalContractCount", "outputs": [ { "name": "value", "type": "uint32" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "ArrayKey", "type": "uint256" } ], "name": "GetHostingContractAddress", "outputs": [ { "name": "value", "type": "address" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "CheckAccountExistence", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "ScrubContractList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "set", "type": "uint256" } ], "name": "SetHostingContractCost", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" }, { "name": "HostingContractExtensionDuration", "type": "uint32" } ], "name": "ExtendHostingContract", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetMainContentHash", "outputs": [ { "name": "MainContentHash", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetContentHashString", "outputs": [ { "name": "ContentHashString", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetContentPathString", "outputs": [ { "name": "ContentPathString", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractDeployedBlockHeight", "outputs": [ { "name": "value", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractExpirationBlockHeight", "outputs": [ { "name": "value", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractStorageUsed", "outputs": [ { "name": "value", "type": "uint32" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractName", "outputs": [ { "name": "value", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "MainContentHash", "type": "string" }, { "name": "HostingContractName", "type": "string" }, { "name": "HostingContractDuration", "type": "uint32" }, { "name": "TotalContractSize", "type": "uint32" }, { "name": "ContentHashString", "type": "string" }, { "name": "ContentPathString", "type": "string" } ], "name": "AddHostingContract", "outputs": [ { "name": "value", "type": "address" } ], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "CustomerAddress", "type": "address" }, { "name": "HostingContractAddress", "type": "address" }, { "name": "AccountCollectionAddress", "type": "address" } ], "name": "RemoveHostingContract2", "outputs": [ { "name": "value", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "AccountCollectionAddress", "type": "address" } ], "name": "SetAccountCollectionAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" } ]');
/*END OF CONTRACT SETUP*/
const $miningMessage = document.querySelector('.mining-message')

/*START OF MISC GLOBAL VARIABLES*/
var privateKeyLogin = false;
var GlobalPrivateKey;
var minimumContractCost = 10000000000000000;

var GlobalUploadName = "";
var GlobalUserAddress = "";
var GlobalHostingCost = 1.0;
var GlobalHostingCostWei = GlobalHostingCost * 1000000000000000000;
var GlobalUploadSize = 0;
var GlobalHashArray = new Array();
var GlobalSizeArray = new Array();
var GlobalPathArray = new Array();
var GlobalMainHashArray = new Array();
var GlobalMainPathArray = new Array();
var GlobalMainContentHash = "";
var GlobalUploadHash = "";
var GlobalUploadPath = "";
var GlobalContractDuration = "";
var GlobalHostingContractArray = new Array();
var GlobalTotalContractCount = 0;
var GlobalHostingContractDetailArray = new Array();
var GlobalExtensionDuration;
/*END OF MISC GLOBAL VARIABLES*/


fetch('https://api.coinmarketcap.com/v2/ticker/3452/').then(response => {
    return response.json();
}).then(data => {
    var ethoPriceUSD = data.data.quotes.USD.price;
    document.getElementById("ethoprice").textContent = round(ethoPriceUSD, 4);
}).catch(err => {});

if (typeof web3 == 'undefined') {
    var web3 = new Web3()
    web3.setProvider(new Web3.providers.HttpProvider('https://rpc.ether1.org'))
    $('#ethofsLoginModal').modal('show');
} else {
    ethofsLogin("");
}

function ethofsLogin(privateKey) {
    $('#ethofsLoginModal').modal('hide');
    $('#ethofsRegistrationModal').modal('hide');
    //CREATE ETHER-1 CHAIN CONNECTION AND LOOK FOR EXISTING USER ACCOUNT
    if (privateKey != "") {
        GlobalPrivateKey = privateKey;
        privateKeyLogin = true;
        web3.eth.net.isListening()
            .then(function() {
                console.log('ethoFS is connected')
                let account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
                console.log(account);
                web3.eth.accounts.wallet.add(account)
                web3.eth.defaultAccount = account.address;
                startEthofs()
            })
    } else {
        privateKeyLogin = false;
        web3 = new Web3(web3.currentProvider);
        web3.eth.getAccounts(function(err, accounts) {
            if (err != null) {
                console.error("An error occurred: " + err);
                outputNoAddressContractTable();
            } else if (accounts.length == 0) {
                $('#ethofsLoginModal').modal('show');
                console.log("User is not logged in");
                document.getElementById("welcome-name").textContent = "Access to Ether-1 Blockchain Not Found - Make Sure You Are Using Metamask or The Ether-1 Browser Extension";
                document.getElementById("accountaddress").textContent = "Address Not Found";
                outputNoAddressContractTable();
            } else {
                console.log("User is logged in");
                web3.eth.defaultAccount = accounts[0];
                startEthofs();
            }
        });
    }
}

function startEthofs() {
    console.log("Starting ethoFS");
    GlobalUserAddress = web3.eth.defaultAccount;
    var ethoFSAccounts = new web3.eth.Contract(GlobalControllerABI, GlobalControllerContractAddress);
    ethoFSAccounts.methods.CheckAccountExistence(GlobalUserAddress).call(function(error, result) {
        if (!error) {
            if (result) {
                document.getElementById("accountaddress").textContent = web3.eth.defaultAccount;
                ethoFSAccounts.methods.GetUserAccountName(GlobalUserAddress).call(function(error, result) {
                    if (!error) {
                        if (result) {
                            getBlockHeight(web3);
                            getBalance(web3);
                            document.getElementById("welcome-name").textContent = "Welcome Back " + result;
                            updateContractTable();
                            startApplication();
                        }
                    } else {
                        console.log("Error getting user account name");
                    }
                });
            } else {
                document.getElementById("welcome-name").textContent = "User Not Found";
                document.getElementById("accountaddress").textContent = "Address Not Found";
                console.log("User Not Found");
                $('#ethofsRegistrationModal').modal('show');
            }
        } else {
            document.getElementById("welcome-name").textContent = "Access to Ether-1 Blockchain Not Found - Make Sure You Are Using Metamask or The Ether-1 Browser Extension";
            document.getElementById("accountaddress").textContent = "Address Not Found";
            console.log("Blockchain Access Error");
        }
    });
}

/*************************************************************************************************************/
function AddNewUser(userName) {
    console.log("Initiating New User Addition... " + userName);
    var controller = new web3.eth.Contract(GlobalControllerABI, GlobalControllerContractAddress);

    if (privateKeyLogin == true) {
        const tx = {
            to: GlobalControllerContractAddress,
            from: GlobalUserAddress,
            gas: 4000000,
            data: controller.methods.AddNewUserPublic(userName).encodeABI()
        };
        var privateKey = '0x' + GlobalPrivateKey;
        web3.eth.accounts.signTransaction(tx, privateKey)
            .then(function(signedTransactionData) {
                web3.eth.sendSignedTransaction(signedTransactionData.rawTransaction, function(error, result) {
                    if (!error) {
                        if (result) {
                            $('#minedBlockTrackerModal').modal('show');
                            waitForReceipt(result, function(receipt) {
                                console.log("Transaction Has Been Mined: " + receipt);
                                $('#minedBlockTrackerModal').modal('hide');
                                ethofsLogin(GlobalPrivateKey);
                            });
                        } else {
                            console.log("There was a problem adding new contract");
                        }
                    } else {
                        console.error(error);
                    }
                });
            });
    } else {
        controller.methods.AddNewUserPublic(userName).send(function(error, result) {
            if (!error) {
                if (result) {
                    document.getElementById("wait").innerHTML = 'Waiting For Add User Confirmation.';
                    $('#minedBlockTrackerModal').modal('show');
                    waitForReceipt(result, function(receipt) {
                        console.log("Transaction Has Been Mined: " + receipt);
                        $('#minedBlockTrackerModal').modal('hide');
                        ethofsLogin("");
                    });
                } else {
                    console.log("There was a problem adding new user");
                    $('#ethofsLoginModal').modal('show');
                }
            } else {
                console.error(error);
                $('#ethofsLoginModal').modal('show');
            }
        });
    }
}
/*************************************************************************************************************/
function getBlockHeight(web3) {
    console.log("Starting Block Height Detection..");
    web3.eth.getBlockNumber(function(err, data) {
        document.getElementById("blocknumber").textContent = data;
        console.log("ETHO Block Number: " + data);
    });
}
/*************************************************************************************************************/
function getBalance(web3) {
    console.log("Starting Balance Detection..");
    web3.eth.getBalance(web3.eth.defaultAccount, function(err, data) {
        var balance = "ETHO Balance: " + Number(web3.utils.fromWei(data, "ether")).toFixed(2);
        document.getElementById("ethobalance").textContent = balance;
        console.log("ETHO Balance: " + data);
    });
}
/*************************************************************************************************************/
//CALCULATE AMOUNT TO BE SENT
function calculateCost(contractSize, contractDuration, hostingCost) {
    var cost = ((((contractSize / 1048576) * hostingCost) * (contractDuration / 46522)));
    if (cost < minimumContractCost) {
        cost = minimumContractCost;
    }
    return cost;
}
/*************************************************************************************************************/
//CHECK FOR TX - BLOCK TO BE MINED
function waitForReceipt(hash, cb) {
    web3.eth.getTransactionReceipt(hash, function(err, receipt) {
        document.getElementById("mining-status-message").textContent = "In Progress";
        $miningMessage.innerText = "Waiting For Transaction Confirmation";
        web3.eth.getBlock('latest', function(e, res) {
            if (!e) {
                document.getElementById("block-height").textContent = res.number;
            }
        });
        if (err) {
            error(err);
            $miningMessage.innerText = "Error Conneting To Ether-1 Network";
        }
        if (receipt !== null) {
            $miningMessage.innerText = "Transaction Confirmed";
            document.getElementById("mining-status-message").textContent = "Complete";
            if (cb) {
                cb(receipt);
            }
        } else {
            setTimeout(function() {
                waitForReceipt(hash, cb);
            }, 10000);
        }
    });
}
/*************************************************************************************************************/
//CREATE ETHER-1 CHAIN CONNECTION AND REMOVE CONTRACT
function RemoveContract(hostingAddress, contentHash) {
    var pinRemoving = new web3.eth.Contract(GlobalControllerABI, GlobalControllerContractAddress);
    if (privateKeyLogin == true) {
        const tx = {
            to: GlobalControllerContractAddress,
            from: GlobalUserAddress,
            gas: 4000000,
            data: pinRemoving.methods.RemoveHostingContract(hostingAddress, contentHash).encodeABI()
        };
        var privateKey = '0x' + GlobalPrivateKey;
        console.log("Private Key: " + privateKey);
        web3.eth.accounts.signTransaction(tx, privateKey)
            .then(function(signedTransactionData) {
                console.log("Signed TX Data: " + signedTransactionData.rawTransaction);
                web3.eth.sendSignedTransaction(signedTransactionData.rawTransaction, function(error, result) {
                    if (!error) {
                        if (result) {
                            $('#minedBlockTrackerModal').modal('show');
                            waitForReceipt(result, function(receipt) {
                                console.log("Transaction Has Been Mined: " + receipt);
                                $('#minedBlockTrackerModal').modal('hide');
                                updateContractTable();
                            });
                        } else {
                            console.log("There was a problem adding new contract");
                        }
                    } else {
                        console.error(error);
                    }
                });
            });
    } else {
        const tx = {
            to: GlobalControllerContractAddress,
            from: GlobalUserAddress,
        };
        pinRemoving.methods.RemoveHostingContract(hostingAddress, contentHash).send(tx, function(error, result) {
            if (!error) {
                if (result) {
                    $('#minedBlockTrackerModal').modal('show');
                    waitForReceipt(result, function(receipt) {
                        console.log("Transaction Has Been Mined: " + receipt);
                        $('#minedBlockTrackerModal').modal('hide');
                        updateContractTable();
                    });
                } else {
                    console.log("There was a problem removing contract");
                }
            } else {
                console.error(error);
            }
        });
    }
}

function updateContractTable() {
    /*************************************************************************************************************/
    //CREATE ETHER-1 CHAIN CONNECTION AND GET USER ACCOUNT & CONTRACTS
    var ethoFSHostingContracts = new Array();
    var hostingContracts = "";
    var TotalContractCount = 0;
    var blockHeight = 0;
    web3.eth.getBlockNumber(function(error, result) {
        if (!error) {
            blockHeight = result;
        } else
            console.error(error);
    });
    var ethoFSAccounts = new web3.eth.Contract(GlobalControllerABI, GlobalControllerContractAddress);
    ethoFSAccounts.methods.GetUserAccountTotalContractCount(web3.eth.defaultAccount).call(function(error, result) {
        TotalContractCount = result;
        GlobalTotalContractCount = result;
        const getContractData = async (ethoFSAccounts, account, TotalContractCount) => {
            if (TotalContractCount == 0) {
                outputNoAddressContractTableWithButton();
            }
            for (var i = 0; i < TotalContractCount; i++) {
                const promisify = (inner) =>
                    new Promise((resolve, reject) =>
                        inner((err, res) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(res);
                            }
                        })
                    );
                var counter = i;
                GlobalHostingContractArray[counter] = new Array();
                var ethoFSHostingContractAddress = promisify(cb => ethoFSAccounts.methods.GetHostingContractAddress(account, counter).call(cb));
                await Promise.all([getAdditionalContractData(await ethoFSHostingContractAddress, counter, ethoFSAccounts)]);

                async function getAdditionalContractData(ethoFSHostingContractAddress, counter, ethoFSAccounts) {
                    const promisify = (inner) =>
                        new Promise((resolve, reject) =>
                            inner((err, res) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(res);
                                }
                            })
                        );
                    var ethoFSHostingContractCost = counter;
                    var ethoFSHostingContractName = promisify(cb => ethoFSAccounts.methods.GetHostingContractName(ethoFSHostingContractAddress).call(cb));
                    var ethoFSHostingContractMainHash = promisify(cb => ethoFSAccounts.methods.GetMainContentHash(ethoFSHostingContractAddress).call(cb));
                    var ethoFSHostingContractHashString = promisify(cb => ethoFSAccounts.methods.GetContentHashString(ethoFSHostingContractAddress).call(cb));
                    var ethoFSHostingContractPathString = promisify(cb => ethoFSAccounts.methods.GetContentPathString(ethoFSHostingContractAddress).call(cb));

                    var ethoFSHostingContractStorage = promisify(cb => ethoFSAccounts.methods.GetHostingContractStorageUsed(ethoFSHostingContractAddress).call(cb));
                    var ethoFSHostingContractStartBlock = promisify(cb => ethoFSAccounts.methods.GetHostingContractDeployedBlockHeight(ethoFSHostingContractAddress).call(cb));
                    var ethoFSHostingContractEndBlock = promisify(cb => ethoFSAccounts.methods.GetHostingContractExpirationBlockHeight(ethoFSHostingContractAddress).call(cb));

                    GlobalHostingContractArray[counter]['address'] = await ethoFSHostingContractAddress;
                    GlobalHostingContractArray[counter]['name'] = await ethoFSHostingContractName;
                    GlobalHostingContractArray[counter]['mainhash'] = await ethoFSHostingContractMainHash;
                    GlobalHostingContractArray[counter]['hashstring'] = await ethoFSHostingContractHashString;
                    GlobalHostingContractArray[counter]['pathstring'] = await ethoFSHostingContractPathString;
                    GlobalHostingContractArray[counter]['storage'] = await ethoFSHostingContractStorage;
                    GlobalHostingContractArray[counter]['startblock'] = await ethoFSHostingContractStartBlock;
                    GlobalHostingContractArray[counter]['endblock'] = await ethoFSHostingContractEndBlock;

                    GlobalHostingContractArray[counter]['hash'] = new Array();
                    GlobalHostingContractArray[counter]['path'] = new Array();

                    var ContractHashArray = new Array();
                    var ContractPathArray = new Array();
                    var splitHashArray = await Promise.all([splitString(await ethoFSHostingContractHashString, ":")]);
                    var splitPathArray = await Promise.all([splitString(await ethoFSHostingContractPathString, ":")]);

                    function splitString(stringToSplit, splitDelimeter) {
                        return stringToSplit.split(splitDelimeter);
                    }
                    await Promise.all([loopSplitStrings(await splitHashArray[0], await splitPathArray[0], counter)]);

                    function loopSplitStrings(splitHashArray, splitPathArray, counter) {
                        for (var j = 1; j < splitHashArray.length; j++) {
                            GlobalHostingContractArray[counter]['hash'][j] = splitHashArray[j];
                            GlobalHostingContractArray[counter]['path'][j] = splitPathArray[j];
                        }
                    }

                    await Promise.all([addNewTableEntry(await ethoFSHostingContractAddress, await ethoFSHostingContractMainHash, await ethoFSHostingContractName, await ethoFSHostingContractAddress, await ethoFSHostingContractStorage, await ethoFSHostingContractStartBlock, await ethoFSHostingContractEndBlock, await ethoFSHostingContractCost, await counter, await blockHeight)]);
                }
            }
            //END GET ADDITIONAL CONTACT DATA
        };
        getContractData(ethoFSAccounts, web3.eth.defaultAccount, TotalContractCount);

        function addNewTableEntry(ethoFSHostingContractAddress, ethoFSHostingContractMainHash, ethoFSHostingContractName, ethoFSHostingContractHash, ethoFSHostingContractStorage, ethoFSHostingContractStartBlock, ethoFSHostingContractEndBlock, ethoFSHostingContractCost, counter, blockHeight) {
            if (blockHeight > ethoFSHostingContractEndBlock) {
                var ethoFSHostingContractStatus = "Expired";
                hostingContracts += '<tr class="tr-shadow" style="display: none;"><td>' + ethoFSHostingContractName + '</td><td><span class="block-email"><a href="#" onclick="showHostingContractDetails(' + counter + ');">' + ethoFSHostingContractHash + '</a></span></td><td class="desc">' + ethoFSHostingContractStartBlock + '</td><td>' + ethoFSHostingContractEndBlock + '</td><td><span class="status--process"><font color="red">' + ethoFSHostingContractStatus + '</font></span></td><td><div class="table-data-feature"><button class="item" data-toggle="tooltip" data-placement="top" title="Delete" onclick="RemoveContract(\'' + ethoFSHostingContractAddress + '\',\'' + ethoFSHostingContractMainHash + '\');"><i class="zmdi zmdi-delete"></i></button><button class="item" data-toggle="tooltip" data-placement="top" title="More" onclick="showHostingContractDetails(' + counter + ');"><i class="zmdi zmdi-more"></i></button></div></td></tr>';
            } else {
                var ethoFSHostingContractStatus = "Active";
                hostingContracts += '<tr class="tr-shadow"><td>' + ethoFSHostingContractName + '</td><td><span class="block-email"><a href="#" onclick="showHostingContractDetails(' + counter + ');">' + ethoFSHostingContractHash + '</a></span></td><td class="desc">' + ethoFSHostingContractStartBlock + '</td><td>' + ethoFSHostingContractEndBlock + '</td><td><span class="status--process">' + ethoFSHostingContractStatus + '</span></td><td><div class="table-data-feature"><button class="item" data-toggle="tooltip" data-placement="top" title="Delete" onclick="RemoveContract(\'' + ethoFSHostingContractAddress + '\',\'' + ethoFSHostingContractMainHash + '\');"><i class="zmdi zmdi-delete"></i></button><button class="item" data-toggle="tooltip" data-placement="top" title="More" onclick="showHostingContractDetails(' + counter + ');"><i class="zmdi zmdi-more"></i></button></div></td></tr>';
            }
            GlobalHostingContractArray[counter]['status'] = ethoFSHostingContractStatus;
            document.getElementById("hostingcontractstablebody").innerHTML = hostingContracts;
        }
    });
}
/*************************************************************************************************************/
//UPDATE CONTRACT DURATION AND CONTRACT COST
function contractDurationChange(selectObj) {
    var duration = document.getElementById('contract-duration').value;
    GlobalContractDuration = duration;
    var ContractCost = (((GlobalUploadSize / 1048576) * GlobalHostingCost) * (duration / 46522));
    document.getElementById("contract-cost").innerHTML = round(ContractCost, 2);
    return false;
}
/*************************************************************************************************************/
//MISC ROUNDING FUNCTION
function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}
/*************************************************************************************************************/
function finishUploadModal() {
    $('#uploadTrackerModal').modal('hide');
    stopApplication();
    resetUploadSystem();
    updateContractTable();
    return false;
}

function resetUploadModal() {
    stopApplication();
    resetUploadSystem();
    updateContractTable();
    return false;
}
/*************************************************************************************************************/
//CHECK FOR PROPAGATED & AVAILABLE DATA ON NETWORK - FINAL VERIFICATION FOR UPLOADED CONTENT
function checkForUploadedContentAvailability(HostingContractName) {
    document.getElementById("upload-check-button").style.visibility = "hidden";
    $('#uploadTrackerModal').modal('show');
    document.getElementById("upload-hash").innerHTML = HostingContractName;
    return false;
}
/*************************************************************************************************************/
/*************************************************************************************************************/
function resetUploadSystem() {
    GlobalMainHashArray = new Array();
    GlobalMainPathArray = new Array();
    GlobalHashArray = new Array();
    GlobalPathArray = new Array();
    GlobalUploadHash = "";
    GlobalUploadPath = "";
    GlobalUploadSize = 0;
    var TableBody = document.getElementById("file-history-body");
    TableBody.innerHTML = '<tr class="empty-row"><td colspan="4">There are no files awaiting upload</td></tr>';
    var duration = document.getElementById('contract-duration').value;
    GlobalContractDuration = duration;
    var ContractCost = ((GlobalUploadSize / 1048576) * GlobalHostingCost) * (duration / 46522);
    document.getElementById("contract-cost").innerHTML = round(ContractCost, 2);
    document.getElementById("upload-hash").innerHTML = "";
    document.getElementById("upload-size").innerHTML = 0;
    return false;
}
/*************************************************************************************************************/
/*************************************************************************************************************/
//CHECK FOR PROPAGATED & AVAILABLE DATA ON NETWORK - FINAL VERIFICATION FOR UPLOADED CONTENT
function sortContractTable() {
    var hostingContracts = "";
    var i;
    var localContractArray = GlobalHostingContractArray;
    var tableSortDirection = "";
    var sortSelection = document.getElementById('sort-contracts');
    var tableSorter = sortSelection.value;
    var filterSelection = document.getElementById('filter-contracts');
    var tableFilterer = filterSelection.value;

    if (tableSorter == "Ascending") {
        tableSortDirection = "asc";
    } else {
        tableSortDirection = "desc";
    }
    localContractArray = multiSort(localContractArray, {
        startblock: tableSortDirection
    });
    var filterCounter = 0;
    for (var i = 0; i < GlobalTotalContractCount; i++) {
        if ((localContractArray[i]['status'] != "Expired" && tableFilterer == "Active Contracts") || (localContractArray[i]['status'] != "Active" && tableFilterer == "Expired Contracts") || tableFilterer == "All Contracts") {
            addNewTableEntry(localContractArray[i]['address'], localContractArray[i]['name'], localContractArray[i]['hash'], localContractArray[i]['storage'], localContractArray[i]['startblock'], localContractArray[i]['endblock'], localContractArray[i]['status'], localContractArray[i]['cost'], i);
            filterCounter++;
        } else {
            document.getElementById("hostingcontractstablebody").innerHTML = hostingContracts;
        }
    }
    if (GlobalTotalContractCount == 0 || filterCounter == 0) {
        hostingContracts = '<tr class="tr-shadow"><td>No Hosting Contracts Found</td><td><span class="block-email"></span></td><td class="desc"></td><td></td><td><span class="status--process"></span></td><td><div class="table-data-feature"></div></td></tr>';
        document.getElementById("hostingcontractstablebody").innerHTML = hostingContracts;

    }

    function addNewTableEntry(ethoFSHostingContractAddress, ethoFSHostingContractName, ethoFSHostingContractHash, ethoFSHostingContractStorage, ethoFSHostingContractStartBlock, ethoFSHostingContractEndBlock, ethoFSHostingContractStatus, ethoFSHostingContractCost, counter) {
        if (ethoFSHostingContractStatus == "Active") {
            hostingContracts += '<tr class="tr-shadow"><td>' + ethoFSHostingContractName + '</td><td><span class="block-email"><a href="#" onclick="showHostingContractDetails(' + counter + ');">' + ethoFSHostingContractHash + '</a></span></td><td class="desc">' + ethoFSHostingContractStartBlock + '</td><td>' + ethoFSHostingContractEndBlock + '</td><td><span class="status--process">' + ethoFSHostingContractStatus + '</span></td><td><div class="table-data-feature"><button class="item" data-toggle="tooltip" data-placement="top" title="Delete" onclick="RemoveContract(\'' + ethoFSHostingContractAddress + '\',\'' + ethoFSHostingContractHash + '\');"><i class="zmdi zmdi-delete"></i></button><button class="item" data-toggle="tooltip" data-placement="top" title="More" onclick="showHostingContractDetails(' + counter + ');"><i class="zmdi zmdi-more"></i></button></div></td></tr>';
        } else {
            hostingContracts += '<tr class="tr-shadow"><td>' + ethoFSHostingContractName + '</td><td><span class="block-email"><a href="#" onclick="showHostingContractDetails(' + counter + ');">' + ethoFSHostingContractHash + '</a></span></td><td class="desc">' + ethoFSHostingContractStartBlock + '</td><td>' + ethoFSHostingContractEndBlock + '</td><td><span class="status--process"><font color="red">' + ethoFSHostingContractStatus + '</font></span></td><td><div class="table-data-feature"><button class="item" data-toggle="tooltip" data-placement="top" title="Delete" onclick="RemoveContract(\'' + ethoFSHostingContractAddress + '\',\'' + ethoFSHostingContractHash + '\');"><i class="zmdi zmdi-delete"></i></button><button class="item" data-toggle="tooltip" data-placement="top" title="More" onclick="showHostingContractDetails(' + counter + ');"><i class="zmdi zmdi-more"></i></button></div></td></tr>';
        }
        document.getElementById("hostingcontractstablebody").innerHTML = hostingContracts;
    }

    function multiSort(array, sortObject = {}) {
        const sortKeys = Object.keys(sortObject);
        // Return array if no sort object is supplied.
        if (!sortKeys.length) {
            return array;
        }
        // Change the values of the sortObject keys to -1, 0, or 1.
        for (let key in sortObject) {
            sortObject[key] = sortObject[key] === 'desc' || sortObject[key] === -1 ? -1 :
                (sortObject[key] === 'skip' || sortObject[key] === 0 ? 0 : 1);
        }
        const keySort = (a, b, direction) => {
            direction = direction !== null ? direction : 1;
            if (a === b) { // If the values are the same, do not switch positions.
                return 0;
            }
            // If b > a, multiply by -1 to get the reverse direction.
            return a > b ? direction : -1 * direction;
        };
        return array.sort((a, b) => {
            let sorted = 0;
            let index = 0;
            // Loop until sorted (-1 or 1) or until the sort keys have been processed.
            while (sorted === 0 && index < sortKeys.length) {
                const key = sortKeys[index];
                if (key) {
                    const direction = sortObject[key];
                    sorted = keySort(a[key], b[key], direction);
                    index++;
                }
            }
            return sorted;
        });
    }
}
/*************************************************************************************************************/
//SHOW MODAL WITH HOSTING CONTRACT DETAILS
function showHostingContractDetails(counter) {
    resetContractExtensionChange();

    GlobalHostingContractDetailArray = GlobalHostingContractArray[counter];
    $('#contractDetailModal').modal('show');
    document.getElementById("contract-detail-name").innerHTML = GlobalHostingContractDetailArray['name'];
    var hashOutputString = "";
    var hostingContractEntry = "";
    for (var i = 1; GlobalHostingContractDetailArray['hash'].length > i; i++) {
        addNewTableEntry(GlobalHostingContractDetailArray['hash'][i], GlobalHostingContractDetailArray['path'][i], i);
    }
    document.getElementById("contract-detail-startblock").innerHTML = GlobalHostingContractDetailArray['startblock'];
    document.getElementById("contract-detail-endblock").innerHTML = GlobalHostingContractDetailArray['endblock'];
    document.getElementById("contract-detail-status").innerHTML = GlobalHostingContractDetailArray['status'];
    document.getElementById("contract-detail-size").innerHTML = (GlobalHostingContractDetailArray['storage'] / 1048576);

    function addNewTableEntry(ethoFSHostingContractHash, ethoFSHostingContractPath, count) {
        var table = document.getElementById("contract-detail-table");
        var row = table.insertRow(count + 10);
        var cell1 = row.insertCell(0);
        //var cell2 = row.insertCell(1);
        //cell1.innerHTML = ethoFSHostingContractPath;
        cell1.innerHTML = '<a  href="http://data.ethofs.com/ipfs/' + ethoFSHostingContractHash + '" target="_blank" style="word-break: break-word">' + ethoFSHostingContractHash + '</a>';
    }

}

function resetContractDetailTableRows() {
    var x = document.getElementById("contract-detail-table").rows.length;
    for (var y = (x - 1); y > 10; y--) {
        document.getElementById("contract-detail-table").deleteRow(y);
    }
}
/*************************************************************************************************************/
//LOCK CONTRACT TABLE DOWN - NO USER ACCOUNT
function outputNoAddressContractTable() {
    hostingContracts = '<tr class="tr-shadow"><td>No Hosting Contracts Found</td><td><span class="block-email"></span></td><td class="desc"></td><td></td><td><span class="status--process"></span></td><td><div class="table-data-feature"></div></td></tr>';
    document.getElementById("hostingcontractstablebody").innerHTML = hostingContracts;
}
//LOCK CONTRACT TABLE DOWN - NO USER ACCOUNT
function outputNoAddressContractTableWithButton() {
    hostingContracts = '<tr class="tr-shadow"><td>No Hosting Contracts Found</td><td><span class="block-email"></span></td><td class="desc"></td><td></td><td><span class="status--process"></span></td><td><div class="table-data-feature"></div></td></tr>';
    document.getElementById("hostingcontractstablebody").innerHTML = hostingContracts;
}
/*************************************************************************************************************/
function resetContractExtensionChange() {
    GlobalExtensionDuration = 0;
    document.getElementById("contract-extension-cost").innerHTML = 0;
    document.getElementById("extend-contract").selectedIndex = "0";
}
/*************************************************************************************************************/
//CONTRACT EXTENSION VALUE CHANGE
function contractExtensionChange(selectObj) {
    var index = selectObj.selectedIndex;
    var extensionDuration = selectObj.options[index].value;
    GlobalExtensionDuration = extensionDuration;
    document.getElementById("contract-extension-button").style.visibility = "visible";
    var extensionCost = ((GlobalHostingContractDetailArray['storage'] / 1048576) * GlobalHostingCost) * (extensionDuration / 46522);
    document.getElementById("contract-extension-cost").innerHTML = round(extensionCost, 2);
}
/*************************************************************************************************************/
//CONTRACT EXTENSION CONFIRM
function contractExtensionConfirmation() {
    if (GlobalExtensionDuration > 0) {
        var extensionDuration = GlobalExtensionDuration;
        var ethoFSController = new web3.eth.Contract(GlobalControllerABI, GlobalControllerContractAddress);

        var extensionCost = calculateCost(GlobalHostingContractDetailArray['storage'], extensionDuration, GlobalHostingCostWei);
        const transactionObject = {
            from: GlobalUserAddress,
            value: extensionCost
        };
        if (privateKeyLogin == true) {
            const tx = {
                to: GlobalControllerContractAddress,
                from: GlobalUserAddress,
                value: extensionCost,
                gas: 4000000,
                data: ethoFSController.methods.ExtendContract(GlobalHostingContractDetailArray['address'], extensionDuration).encodeABI()
            };
            var privateKey = '0x' + GlobalPrivateKey;
            console.log("Private Key: " + privateKey);
            web3.eth.accounts.signTransaction(tx, privateKey)
                .then(function(signedTransactionData) {
                    console.log("Signed TX Data: " + signedTransactionData.rawTransaction);
                    web3.eth.sendSignedTransaction(signedTransactionData.rawTransaction, function(error, result) {
                        if (!error) {
                            if (result) {
                                $('#contractDetailModal').modal('hide');
                                $('#minedBlockTrackerModal').modal('show');
                                waitForReceipt(result, function(receipt) {
                                    console.log("Transaction Has Been Mined: " + receipt);
                                    $('#minedBlockTrackerModal').modal('hide');
                                    updateContractTable();
                                });
                            } else {
                                console.log("There was a problem adding new contract");
                            }
                        } else {
                            console.error(error);
                        }
                    });
                });
        } else {

            ethoFSController.methods.ExtendContract(GlobalHostingContractDetailArray['address'], extensionDuration).send(transactionObject, function(error, result) {
                if (!error) {
                    if (result) {
                        $('#contractDetailModal').modal('hide');
                        $('#minedBlockTrackerModal').modal('show');
                        waitForReceipt(result, function(receipt) {
                            console.log("Transaction Has Been Mined: " + receipt);
                            $('#minedBlockTrackerModal').modal('hide');
                            updateContractTable();
                        });
                    }
                } else {
                    console.log(error);
                }
            });
        }
    }
}
/*************************************************************************************************************/

/* ===========================================================================
   Pubsub
   =========================================================================== */

const subscribeToHealthChannel = () => {
  window.node.pubsub.subscribe(info.id + "_alpha11", healthMessageHandler)
    .catch(() => onError('An error occurred when subscribing to the health check workspace.'))
}
const healthMessageHandler = (message) => {
    healthMessage = message.data.toString();
    UpdateHealthCheckInfo(healthMessage);
}
function UpdateHealthCheckInfo(healthMessage) {
    var mainMessage = healthMessage.split(";")[1];
    var splitMessage = mainMessage.split(",");
    var usedStorageTotal = 0;
    var availableStorageTotal = 0;
    var activeHistory = 0;
    var nodeCounter = 0;
    splitMessage.forEach(function(nodeMessage, index) {
        var nodeSplitMessage = nodeMessage.split(":");
        activeHistory = Number(nodeSplitMessage[5]);
        if(activeHistory >= 5){
            nodeCounter++;
            usedStorageTotal += Number(nodeSplitMessage[8]);
            availableStorageTotal += Number(nodeSplitMessage[7]);
        }
        if(index == (splitMessage.length - 1)){
            updateStorageArrays(usedStorageTotal, availableStorageTotal, nodeCounter);
        }
    });
    function updateStorageArrays(usedStorageTotal, availableStorageTotal, nodecount){

        if(availableStorageArray.length >= 50){
            if(availableStorageTotal > 0.75 * averageAvailableStorageTotal && availableStorageTotal < 1.25 * averageAvailableStorageTotal){
                availableStorageArray.push(availableStorageTotal);
                availableStorageArray.shift();
            }
        }else{
            availableStorageArray.push(availableStorageTotal);
        }
        if(nodeCountArray.length >= 50){
            nodeCountArray.push(nodecount);
            nodeCountArray.shift();
        }else{
            nodeCountArray.push(nodecount);
        }
        calculateStorageAverages(usedStorageArray, availableStorageArray, nodeCountArray);
    }
    function calculateStorageAverages(usedStorageArray, availableStorageArray, nodeCountArray){

        var sumAvailableStorage = 0;
        availableStorageArray.forEach(function(value, index) {
            sumAvailableStorage += value;
            if(index == (availableStorageArray.length - 1)){
                averageAvailableStorageTotal = (sumAvailableStorage/availableStorageArray.length);
                document.getElementById("nodestorage").textContent=(round(2+((averageAvailableStorageTotal)/1000000), 1)) + "TB";
            }
        });
        var sumNodeCount = 0;
        nodeCountArray.forEach(function(value, index) {
            sumNodeCount += value;
            if(index == (nodeCountArray.length - 1)){
                var averageNodeCount = (sumNodeCount/nodeCountArray.length) + 19;
                document.getElementById("nodecount").textContent=(round(averageNodeCount, 0));
            }
        });
    }
}


const messageHandler = (message) => {
    messageString = message.data.toString();
}
const receiveExitMsg = (msg) => console.log("Content Upload Successful")
const exitMessageHandler = (message) => {
    const cancelMessageString = message.data.toString()
}

const subscribeToMessaging = () => {
  for(var i = 4; i < PeersForChannel.length; i++){
    window.node.pubsub.subscribe(PeersForChannel[i] + "PinningChannel_alpha11", messageHandler)
    .catch(() => onError('An error occurred when subscribing to the workspace.'))
  }
}
const unsubscribeToMessaging = () => {
  for(var i = 4; i < PeersForChannel.length; i++){
  window.node.pubsub.unsubscribe(PeersForChannel[i] + "PinningChannel_alpha11", exitMessageHandler)
    .catch(() => onError('An error occurred when unsubscribing to the workspace.'))
  }
}
const publishImmediatePin = (hash) => {
    const data = Buffer.from(hash)
    for (var i = 0; i < PeersForChannel.length; i++) {
        var channel = PeersForChannel[i] + "ImmediatePinningChannel_alpha11";
        window.node.pubsub.publish(channel, data)
            .catch(() => onError('An error occurred when publishing the message.'))
    }
}

/* ===========================================================================
   Files handling
   =========================================================================== */
const sendFileList = () => FILES.forEach((hash) => publishHash(hash))

/*const updateProgress = (bytesLoaded) => {
    let percent = 100 - ((bytesLoaded / fileSize) * 100)
    if (percent <= 5) {
        document.getElementById("upload-confirm-button").style.visibility = "visible";
    }
    $progressBar.style.transform = `translateX(${-percent}%)`
}*/

const resetProgress = () => {
    $progressBar.style.transform = 'translateX(-100%)'
}

function appendFile(name, hash, size, data) {
    const file = new window.Blob([data], {
        type: 'application/octet-binary'
    })
    const url = window.URL.createObjectURL(file)
    const row = document.createElement('tr')

    const nameCell = document.createElement('td')
    nameCell.innerHTML = name

    const hashCell = document.createElement('td')
    hashCell.innerHTML = hash

    const sizeCell = document.createElement('td')
    sizeCell.innerText = size

    const downloadCell = document.createElement('td')
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', name)
    link.innerHTML = '<img width=20 class="table-action" src="assets/dashboard/images/download.svg" alt="Download" />'
    downloadCell.appendChild(link)

    row.appendChild(nameCell)
    row.appendChild(hashCell)
    row.appendChild(sizeCell)
    row.appendChild(downloadCell)

    $fileHistory.insertBefore(row, $fileHistory.firstChild)
}

function resetFileTable() {
    while ($fileHistory.hasChildNodes()) {
        $fileHistory.removeChild($fileHistory.firstChild);
    }
}
/* Drag & Drop
   =========================================================================== */

const onDragEnter = (event) => $dragContainer.classList.add('dragging')
const onDragLeave = () => $dragContainer.classList.remove('dragging')

function startUploadProcess() {
    console.log("Starting Upload Process..");
    $('#preparingUploadModal').modal('show');
    var streamFinishCount = 0;
    for (var i = 0; i < MainFileArray.length; i++) {
        const streamFiles = (files) => {
            const stream = node.addReadableStream()
            stream.on('data', function(data) {
                console.log("Data...");
                console.log(data);
                GlobalHashArray.push(`${data.hash}`);
                GlobalSizeArray.push(`${data.size}`);
                GlobalPathArray.push(`${data.path}`);
                GlobalUploadHash = `${data.hash}`;
                GlobalUploadPath = `${data.path}`;
                var splitString = GlobalUploadPath.split("/")
                if (splitString.length == 1 || splitString[0] == "") {
                    streamFinishCount++;
                    GlobalMainHashArray.push(`${data.hash}`);
                    GlobalMainPathArray.push(`${data.path}`);
                    if(streamFinishCount == MainFileArray.length) {
                        createMainHash();
                    }
                }
            });
            files.forEach(file => stream.write(file))
            stream.end()
        }
        var filesForStream = MainFileArray[i];
        streamFiles(filesForStream);
    }

    const streamFilesExternally = (filesArray, MainHashArray) => {

        var confirmationServers = ["https://ipfsapi.ethofs.com/ipfs/", "https://ipfsapi1.ethofs.com/ipfs/", "https://ipfsapi2.ethofs.com/ipfs/", "https://ipfsapi5.ethofs.com/ipfs/", "https://ipfsapi6.ethofs.com/ipfs/", "https://ipfsapi7.ethofs.com/ipfs/"];
        let hashVerificationArray = [...GlobalHashArray, ...GlobalMainHashArray];
        hashVerificationArray.push(GlobalMainContentHash);
        var hashConfirmationCount = 0;


        for (var i = 0; i < MainHashArray.length; i++) {
            console.log("Sending Immediate Pin Request: " + MainHashArray[i]);
            publishImmediatePin(MainHashArray[i]);
        }
        setTimeout(function() {
            hashVerificationArray.forEach(function(hash) {
                verifyDataUpload(hash);
            });
        }, 5000);

        const verifyDataUpload = async hash => {
            var confirmationServer = confirmationServers[Math.floor(Math.random() * confirmationServers.length)];
            var url = confirmationServer + hash;
            try {
                const response = await fetch(url);
                console.log("Data Confirmation Status: " + response.status + " Hash: " + hash);
                if (response.status == 200) {
                    hashConfirmationCount++;
                    var confirmationPercentage = Math.ceil((hashConfirmationCount / hashVerificationArray.length) * 100);
                    updateUploadProgress(confirmationPercentage);
                    console.log("Data Upload Confirmation Received: " + hashConfirmationCount + "/" + hashVerificationArray.length);
                    $uploadMessage.innerText = "Upload Confirmation Received: " + hashConfirmationCount + "/" + hashVerificationArray.length;
                    if (confirmationPercentage >= 99) {
                        $uploadMessage.innerText = "Upload Complete";
                        document.getElementById("upload-status-message").textContent = "Complete";
                        finishUploadModal();
                    }
                } else {
                    setTimeout(function() {
                        verifyDataUpload(hash)
                    }, 2000);
                }
            } catch (error) {
                console.log(error);
                console.log("Data Confirmation Error: " + error.status);
                setTimeout(function() {
                    verifyDataUpload(hash)
                }, 2000);
            }
        };
    }

    function updateUploadProgress(width) {
        var elem = document.getElementById("myBar");
        width = round(width, 2);
        if (width >= 100) {
            width = 100;
            elem.style.width = width + '%';
            elem.innerHTML = width * 1 + '%';
        }
        elem.style.width = width + '%';
        elem.innerHTML = width * 1 + '%';
    }

    function createMainHash() {
        var contentHashString = GlobalChannelString;
        for (i = 0; i < GlobalMainHashArray.length; i++) {
            contentHashString += ":" + GlobalMainHashArray[i];
        }
        window.node.add(Buffer.from(contentHashString), (err, res) => {
            if (err || !res) {
                return console.error('ipfs add error', err, res)
            }
            res.forEach((file) => {
                if (file && file.hash) {
                    GlobalMainContentHash = file.hash;
                    AddNewPin(GlobalUploadHash, GlobalUploadSize, document.getElementById('newcontractname').value, GlobalContractDuration);
                }
            });
        });
    }

    /*****************************************************************************/
    function AddNewPin(pinToAdd, pinSize, HostingContractName, HostingContractDuration) {
        var contentHashString = GlobalChannelString;
        var contentPathString = GlobalChannelString;
        for (i = 0; i < GlobalMainHashArray.length; i++) {
            contentHashString += ":" + GlobalMainHashArray[i];
            contentPathString += ":" + GlobalMainPathArray[i];
        }
        var MainHashArray = GlobalMainHashArray;
        GlobalUploadName = HostingContractName;
        var contractCost = calculateCost(pinSize, HostingContractDuration, GlobalHostingCostWei);
        var pinAdding = new web3.eth.Contract(GlobalControllerABI, GlobalControllerContractAddress);
        const transactionObject = {
            from: GlobalUserAddress,
            value: contractCost
        };
        console.log("Contract Address: " + GlobalControllerContractAddress + " Value: " + contractCost);
        if (privateKeyLogin == true) {
            const tx = {
                to: GlobalControllerContractAddress,
                from: GlobalUserAddress,
                value: contractCost,
                gas: 4000000,
                data: pinAdding.methods.AddNewContract(GlobalMainContentHash, HostingContractName, HostingContractDuration, pinSize, pinSize, contentHashString, contentPathString).encodeABI()
            };
            var privateKey = '0x' + GlobalPrivateKey;
            console.log("Private Key: " + privateKey);
            web3.eth.accounts.signTransaction(tx, privateKey)
                .then(function(signedTransactionData) {
                    console.log("Signed TX Data: " + signedTransactionData.rawTransaction);
                    web3.eth.sendSignedTransaction(signedTransactionData.rawTransaction, function(error, result) {
                        if (!error) {
                            if (result) {
                                console.log("Result: " + result);
                                $('#minedBlockTrackerModal').modal('show');
                                $('#preparingUploadModal').modal('hide');
                                waitForReceipt(result, function(receipt) {
                                    console.log("Transaction Has Been Mined: " + receipt);
                                    $('#minedBlockTrackerModal').modal('hide');
                                    $('#nodeModal').modal('hide');
                                    var filesForStream = MainFileArray;
                                    streamFilesExternally(filesForStream, MainHashArray);
                                    checkForUploadedContentAvailability(HostingContractName);
                                });
                            } else {
                                console.log("There was a problem adding new contract");
                            }
                        } else {
                            console.error(error);
                        }
                    });
                });
        } else {
            pinAdding.methods.AddNewContract(GlobalMainContentHash, HostingContractName, HostingContractDuration, pinSize, pinSize, contentHashString, contentPathString).send(transactionObject, function(error, result) {
                if (!error) {
                    if (result) {
                        $('#minedBlockTrackerModal').modal('show');
                        $('#preparingUploadModal').modal('hide');
                        waitForReceipt(result, function(receipt) {
                            console.log("Transaction Has Been Mined: " + receipt);
                            $('#minedBlockTrackerModal').modal('hide');
                            $('#nodeModal').modal('hide');
                            var filesForStream = MainFileArray;
                            streamFilesExternally(filesForStream, MainHashArray);
                            checkForUploadedContentAvailability(HostingContractName);
                        });
                    } else {
                        console.log("There was a problem adding new contract");
                    }
                } else {
                    console.error(error);
                }
            });
        }
    }
    /*****************************************************************************/
}

function resetUploadProcess() {
    MainFileArray = new Array();
    GlobalUploadSize = 0;
}

function updateAnalyzeProgress(width) {
    var elem = document.getElementById("myAnalyzeBar");
    width = round(width, 2);
    if (width >= 100) {
        width = 100;
        elem.style.width = width + '%';
        elem.innerHTML = width * 1 + '%';
    }
    elem.style.width = width + '%';
    elem.innerHTML = width * 1 + '%';
}

function onFileUpload(event) {
    event.preventDefault()
    document.getElementById("upload-hash").textContent = "ANALYZING UPLOAD DATA";
    document.getElementById("upload-confirm-button").style.visibility = "hidden";
    MainFileArray.push([]);
    let dirSelected = event.target.files;
    let dirPath = dirSelected[0].path;
    var streamCompareCount = 0;
    var totalUploadItems = 0;
    readDirectoryContents(dirPath);

    function readDirectoryContents(directory) {
        console.log("Directory Path: " + directory);
        fs.readdir(directory, function(err, filesUploaded) {
            if(!err) {
                for (let i = 0; filesUploaded.length > i; i++) {
                    handleItem(filesUploaded[i], directory);
                }
            } else {
                console.log("File Upload Error: " + err);
            }
        });
    }

    function handleItem(filename, relativePath) {
        var filepath = relativePath.concat('\\', filename);
        fs.stat(filepath, function(err, stats) {
            if(!err) {
            if(stats.isDirectory()) {
                readDirectoryContents(filepath)
            } else {
                streamCompareCount ++;
                totalUploadItems ++;
                console.log("File Path: " + filepath);
                fs.readFile(filepath, function(err, file) {
                    var filetowrite = {
                        path: filepath,
                        content: file
                    };
                    var filename = filepath;
                    MainFileArray[MainFileArray.length - 1].push(filetowrite);
                    GlobalUploadSize += Number(stats.size);
                    fileSize += Number(stats.size);
                    var totalUploadSizeMB = GlobalUploadSize / 1000000;
                    appendFile(filepath, filename, stats.size, null);
                    console.log("Path: " + filepath + " Size: " + stats.size + " Total Size: " + GlobalUploadSize);
                    document.getElementById("upload-size").textContent = totalUploadSizeMB;
                    contractDurationChange(document.getElementById('contract-duration').value);
                    streamCompareCount--;
                    updateAnalyzeProgress(((totalUploadItems - streamCompareCount) / totalUploadItems));
                    if (streamCompareCount == 0) {
                        document.getElementById("upload-hash").textContent = "READY FOR UPLOAD";
                        document.getElementById("upload-confirm-button").style.visibility = "visible";
                    }
                });
            }
        } else {
            console.log("File Stats Error: " + err);
        }            
        });
    }
}

function onDrop(event) {
    MainFileArray.push([]);
    document.getElementById("upload-hash").textContent = "ANALYZING UPLOAD DATA";
    document.getElementById("upload-confirm-button").style.visibility = "hidden";
    fileSize = 0;
    resetProgress();
    onDragLeave()
    event.preventDefault()
    if (GlobalUploadHash != "" && GlobalUploadPath != "") {
        GlobalMainHashArray.push(GlobalUploadHash);
        GlobalMainPathArray.push(GlobalUploadPath);
    }
    const dt = event.dataTransfer
    const filesDropped = dt.files
    const itemsDropped = dt.items

    function readFileContents(file) {
        return new Promise((resolve) => {
            const reader = new window.FileReader()
            reader.onload = (event) => resolve(event.target.result)
            reader.readAsArrayBuffer(file)
        })
    }
    var totalItemCount = 0;
    var streamCompareCount = 0;

    function initialHandleItems(items) {
        const files = [];
        totalItemCount = items.length;
        streamCompareCount = items.length;
        for (var item of items) {
            var awaitHandleEntry = handleEntry(item.webkitGetAsEntry());
        }

        function handleEntry(entry) {
            if (entry.isFile) {
                getFile(entry);

                function getFile(entry) {
                    entry.file(function(file) {
                        readFileContents(file)
                            .then((buffer) => {
                                var filePath = entry.fullPath;
                                var filetowrite = {
                                    path: entry.fullPath,
                                    content: Buffer.from(buffer)
                                };
                                MainFileArray[MainFileArray.length - 1].push(filetowrite);
                                GlobalUploadSize += Number(file.size);
                                fileSize += Number(file.size);
                                var totalUploadSizeMB = GlobalUploadSize / 1000000;
                                appendFile(entry.fullPath, entry.name, file.size, null);
                                document.getElementById("upload-size").textContent = totalUploadSizeMB;
                                contractDurationChange(document.getElementById('contract-duration').value);
                                streamCompareCount--;
                                updateAnalyzeProgress(((totalItemCount - streamCompareCount) / totalItemCount));
                                if (streamCompareCount == 0) {
                                    document.getElementById("upload-hash").textContent = "READY FOR UPLOAD";
                                    document.getElementById("upload-confirm-button").style.visibility = "visible";
                                }
                            });
                    });
                }

            } else if (entry.isDirectory) {
                let directoryReader = entry.createReader();
                directoryReader.readEntries(function(entries) {
                    streamCompareCount += entries.length - 1;
                    totalItemCount += entries.length - 1;
                    entries.forEach(function(newEntry) {
                        handleEntry(newEntry);
                    });
                });
            }
        }

    }
    initialHandleItems(event.dataTransfer.items);
}

/* ===========================================================================
   Peers handling
   =========================================================================== */

function connectToPeer(event) {
    const multiaddr = $multiaddrInput.value

    if (!multiaddr) {
        return onError('No multiaddr was inserted.')
    }

    window.node.swarm.connect(multiaddr)
        .then(() => {
            onSuccess(`Successfully connected to peer.`)
            $multiaddrInput.value = ''
        })
        .catch(() => onError('An error occurred when connecting to the peer.'))
}

function updatePeerProgress(width, peercount) {
    var backgroundcolor = "";
    var elem = document.getElementById("myPeerBar");
    width = round(width, 2);
    if (width >= 100) {
        width = 100;
    }
    if (width >= 80) {
        backgroundcolor = '"#3CB371"';
    } else if (width >= 40 && width < 80) {
        backgroundcolor = '"#FFFF00"';
    } else {
        backgroundcolor = '"#FF0000"';
    }
    elem.style.width = width + '%';
}

function refreshPeerList() {
    var updatedPeerCount = 0;
    window.node.swarm.peers()
        .then((peers) => {
            const peersAsHtml = peers.reverse()
                .map((peer) => {
                    if (peer.addr) {
                        const addr = peer.addr.toString()
                        if (addr.indexOf('ipfs') >= 0) {
                            return addr
                        } else {
                            return addr + peer.peer.id.toB58String()
                        }
                    }
                })
                .map((addr) => {
                    var splitString = addr.split("/");
                    addr = splitString[splitString.length - 1];
                    updatedPeerCount++;
                    if (!PeersForChannel.includes(addr)) {
                        PeersForChannel.push(addr);
                    }
                    return `<tr><td>${addr}</td></tr>`
                }).join('')

        }).then(() => {
            updatePeerProgress(((updatedPeerCount / 7) * 100), updatedPeerCount)
        })
        .catch((error) => onError(error))
}

/* ===========================================================================
   Error handling
   =========================================================================== */

function onSuccess(msg) {
    $logs.classList.add('success')
    $logs.innerHTML = msg
}

function onError(err) {
    let msg = 'An error occured, check the dev console'

    if (err.stack !== undefined) {
        msg = err.stack
    } else if (typeof err === 'string') {
        msg = err
    }

    $logs.classList.remove('success')
    $logs.innerHTML = msg
}

window.onerror = onError

/* ===========================================================================
   App states
   =========================================================================== */

const states = {
    ready: () => {
        const addressesHtml = window.info.addresses.map((address) => {
            return `<li><pre>${address}</pre></li>`
        }).join('')
        $nodeId.innerText = window.info.id
        $allDisabledButtons.forEach(b => {
            b.disabled = false
        })
        $allDisabledInputs.forEach(b => {
            b.disabled = false
        })
        $allDisabledElements.forEach(el => {
            el.classList.remove('disabled')
        })
    }
}

function updateView(state, ipfs) {
    if (states[state] !== undefined) {
        states[state]()
    } else {
        throw new Error('Could not find state "' + state + '"')
    }
}
/* ===========================================================================
   Boot the app
   =========================================================================== */
function startApplication() {
    // Setup event listeners
    $dragContainer.addEventListener('dragenter', onDragEnter)
    $dragContainer.addEventListener('dragover', onDragEnter)
    $dragContainer.addEventListener('drop', onDrop)
    $dragContainer.addEventListener('dragleave', onDragLeave)
    document.getElementById("fileUploadButton").addEventListener("change", onFileUpload)
    //start()
    window.startNode()
    extendedStartApplication()
}

function extendedStartApplication() {
    $ethomessage.innerText = GlobalUserAddress;
}
function stopApplication() {
    resetUploadProcess();
    resetFileTable();
}
