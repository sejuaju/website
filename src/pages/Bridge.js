import React, { useEffect, useState } from 'react'
import "./Lock.css";
// import Setting from '../component/Setting';


import { HalfMalf } from "react-spinner-animated";
import "react-spinner-animated/dist/index.css";

import { ToastContainer, toast } from "react-toastify";

import useMetaMask from "../wallet/index";
import Web3 from "web3";
import axios from "axios";

import TOKEN from "../abi/Token.json";
import BRIDGE from "../abi/Bridge.json";

function Bridge() {

    const { isActive, account, library, chainId } = useMetaMask();

    // const percentage = 0.06;
    // var API_URL = "http://localhost:4000/swap";
    var API_URL = "http://143.244.143.74/api/swap";

    const network = [{
        name: "BSC",
        symbol: "BNB",
        chainId: 56,
        chainIdHex: "0x38",
        image: "/images/smart-chain.svg",
        RPC_URL: "https://bsc-dataseed1.binance.org/",
        tokenAddress: "0xB5a907Cd8e88bc8513d9e2614d57c38B45B48Ecc",
        bridgeAddress: "0x66419FF7dC09D79C9aBc88c3230Da95F8340aAF1",
    },
    {
        name: "MATIC",
        symbol: "MATIC",
        chainId: 137,
        image: "/images/polygon.svg",
        chainIdHex: "0x89",
        RPC_URL: "https://polygon-rpc.com/",
        tokenAddress: "0xFa7620C72F7e3F8C39e8EaB5e40a92867e83B72D",
        bridgeAddress: "0x02E892E66A9c446865371c85efD151F13Ae53f74",
    },
    {
        name: "FTM",
        symbol: "FTM",
        chainId: 250,
        chainIdHex: "0xFA",
        image: "/images/fantom.svg",
        RPC_URL: "https://rpcapi.fantom.network/",
        tokenAddress: "0x06b3CC551a4C3e6E4732FED9297A1aaa9CfE08B3",
        bridgeAddress: "0x8ceEcB18c509E2f5a4Ae9ebd6BA72dd1919b50CB",
    },
    ];
    const [activeNetwork1, setActiveNetwork1] = useState({});
    const [activeNetwork2, setActiveNetwork2] = useState({});
    const [otherNetwork, setOtherNetwork] = useState({});

    const [swapAmount, setSwapAmount] = useState("");
    const [outputAmount, setOutputAmount] = useState(0);

    const [balance1, setBalance1] = useState(0);
    const [balance2, setBalance2] = useState(0);

    const [loading, setLoading] = useState(false);
    const [swapLoading, setSwapLoading] = useState(false);
    const [allowance, setAllowance] = useState(false);
    const [pow, setPOW] = useState(false);

    const notify = (isError, msg) => {
        if (isError) {
            toast.error(msg, {
                position: toast.POSITION.TOP_RIGHT,
            });
        } else {
            toast.success(msg, {
                position: toast.POSITION.TOP_RIGHT,
            });
        }
    };

    const approve = async () => {
        setLoading(true);
        try {
            var contract = new library.eth.Contract(TOKEN, activeNetwork1.tokenAddress);
            var Router = activeNetwork1.bridgeAddress;

            var amountIn = 10 ** 69;
            amountIn = amountIn.toLocaleString("fullwide", { useGrouping: false });

            await contract.methods
                .approve(Router, amountIn.toString())
                .send({ from: account })
                .then(async () => {
                    await loadUserData();
                    notify(false, "enable token successfully");
                    setAllowance(false);
                    setLoading(false);
                });
        } catch (err) {
            console.log(err);
        }
    };

    const swapBalance = async () => {
        setLoading(true);
        setSwapLoading(true);

        var bscBridgeContract = new library.eth.Contract(
            BRIDGE,
            activeNetwork1.bridgeAddress
        );

        var amount = swapAmount * pow;
        // var BN = library.utils.BN;
        // var amountIn = new BN(amount.toString());
        amount = amount.toLocaleString("fullwide", { useGrouping: false });
        try {
            await bscBridgeContract.methods
                .swap(amount.toString())
                .send({ from: account })
                .then(async (result) => {
                    await axios
                        .post(API_URL, {
                            fromChain: activeNetwork1.name,
                            toChain: activeNetwork2.name,
                            hash: result.transactionHash,
                            account: account
                        })
                        .then(function (response) {
                            notify(
                                false,
                                `Transaction has been created, you will receive fund in a while`
                            );
                            setSwapAmount("");
                            setOutputAmount("");
                            loadUserData();
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                });
            setLoading(false);
            setSwapLoading(false);
        } catch (e) {
            notify(true, e.message);
            setSwapLoading(false);
            setLoading(false);
        }
    };

    const loadUserData = async () => {
        setLoading(true);
        const web3 = new Web3(activeNetwork1.RPC_URL);
        var token = new web3.eth.Contract(TOKEN, activeNetwork1.tokenAddress);

        var getAllowance = await token.methods
            .allowance(account, activeNetwork1.bridgeAddress)
            .call();

        if (getAllowance <= 2) {
            setAllowance(true);
        }

        var tokenDecimals = await token.methods.decimals().call();
        var tokenPOW = Math.pow(10, tokenDecimals);
        setPOW(tokenPOW);

        var balance1 = await token.methods.balanceOf(account).call();
        var tempbal = (parseFloat(balance1) / tokenPOW);
        setBalance1((tempbal - 0.000000010).toFixed(9))


        const sweb3 = new Web3(activeNetwork2.RPC_URL);
        var token2 = new sweb3.eth.Contract(TOKEN, activeNetwork2.tokenAddress);

        var tokenDecimals2 = await token2.methods.decimals().call();
        var tokenPOW2 = Math.pow(10, tokenDecimals2);
        var balance2 = await token2.methods.balanceOf(account).call();

        setBalance2((parseFloat(balance2) / tokenPOW2).toFixed(8))

        setLoading(false);
    };

    const setActiveNetwork = async () => {
        setLoading(true);
        if (chainId === 56) {
            setActiveNetwork1(network[0]);
            setActiveNetwork2(network[1]);
            setOtherNetwork(network[2]);
        } else if (chainId === 137) {
            setActiveNetwork1(network[1]);
            setActiveNetwork2(network[0]);
            setOtherNetwork(network[2]);
        } else if (chainId === 250) {
            setActiveNetwork1(network[2]);
            setActiveNetwork2(network[0]);
            setOtherNetwork(network[1]);
        } else {
            setActiveNetwork1(network[0]);
            setActiveNetwork2(network[1]);
            setOtherNetwork(network[2]);
        }
    };

    const handleFromNetwork = async (network) => {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: network.chainIdHex }], // chainId must be in hexadecimal numbers
        });
        window.location.reload();
    };
    const handleToNetwork = () => {
        var temp = otherNetwork;
        setOtherNetwork(activeNetwork2);
        setActiveNetwork2(temp);
    };

    useEffect(() => {
        if (isActive && activeNetwork1?.name) {
            loadUserData();
        }
    }, [isActive, account, activeNetwork1, activeNetwork2, chainId]);

    useEffect(() => {
        setActiveNetwork();
    }, [isActive, account, chainId]);


    return (
        <div>
            <div className="page-wrapper">
                <div className="content container-fluid">
                    <div className='heading-title'>Bridge</div>
                    <div className="row justify-content-center align-items-center">
                        <div className="tabs-wrapper">
                            <div className='checkout-form-centre' style={{ padding: '9px 0px 50px 0px' }}>
                                <div className='checkout-login-step'>
                                    <div className='lock-title'>Cross Chain </div>
                                    {/* <div className='setting-icon'>
                                        <i class="fa fa-clock-o" aria-hidden="true" style={{ marginRight: '15px' }}></i>
                                        <i class="fa fa-sliders" aria-hidden="true" data-toggle="modal" data-target="#exampleModal1"></i>
                                        <Setting />
                                    </div> */}

                                    <div className='cross-chain'>
                                        <p>your Balance : {balance1}</p>
                                        <div className='flex'>
                                            <div className='cross-chain-left'>
                                                <p>From :</p>
                                                <div class="dropdown">
                                                    <button class="btn drp dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                        {activeNetwork1.name}<img src={activeNetwork1.image} alt="Logo" />
                                                    </button>
                                                    <div class="dropdown-menu scrollbar" aria-labelledby="dropdownMenuButton">
                                                        <a class="dropdown-item" onClick={() => handleFromNetwork(activeNetwork2)}> <img src={activeNetwork2.image} alt="Logo" />{activeNetwork2.name}</a>
                                                        <a class="dropdown-item" onClick={() => handleFromNetwork(otherNetwork)}> <img src={otherNetwork.image} alt="Logo" />{otherNetwork.name}</a>

                                                    </div>
                                                </div>
                                            </div>
                                            <div className='cross-chain-right'>
                                                <div className='d-flex'>
                                                    <input
                                                        type="text"
                                                        class="form-control"
                                                        id="inputName"
                                                        placeholder='0.00'
                                                        value={swapAmount}
                                                        disabled={loading}
                                                        onChange={(e) => {
                                                            setSwapAmount(e.target.value);
                                                            setOutputAmount(e.target.value)
                                                        }}
                                                    />
                                                    <button type="button" class="max" onClick={() => { setSwapAmount(balance1); setOutputAmount(balance1) }}>Max</button>
                                                    <img src="images/matakala-logo.svg" alt="Logo" />
                                                    <div className='token'>mata</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='swap-icon'>
                                        <button type='button'><i className="fa fa-arrow-down"></i></button>
                                    </div>


                                    <div className='cross-chain mb-5'>
                                        <div className='flex'>
                                            <div className='cross-chain-left'>
                                                <p>To :</p>
                                                <div class="dropdown">
                                                    <button class="btn drp dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                        {activeNetwork2.name}<img src={activeNetwork2.image} alt="Logo" />
                                                    </button>
                                                    <div class="dropdown-menu scrollbar" aria-labelledby="dropdownMenuButton">
                                                        <a class="dropdown-item" onClick={() => handleToNetwork()}> <img src={otherNetwork.image} alt="Logo" />{otherNetwork.name}</a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='cross-chain-right'>
                                                <div className='d-flex'>
                                                    <input type="text" class="form-control" id="inputName" value={outputAmount} readOnly />
                                                    {/* <button type="button" class="max">Max</button> */}
                                                    <img src="images/matakala-logo.svg" alt="Logo" />
                                                    <div className='token'>mata</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {isActive ?
                                        allowance ?
                                            <button
                                                type="button"
                                                className="lock-btn mb-3"
                                                onClick={() => approve()}
                                                disabled={loading} >
                                                {loading ? "Please wait, Loading.." : "Enable"}
                                            </button>
                                            : <button
                                                type="button"
                                                className="lock-btn mb-3"
                                                onClick={() => swapBalance()}
                                                disabled={loading}
                                            >
                                                {loading ? "Please wait, Loading.." : "Swap"}
                                            </button> :
                                        ""
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Bridge