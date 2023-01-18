import React, { useState, useEffect } from 'react'
import "./Lock.css";
import "./dropdown.css";

import { tokenList } from "../token/token";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FromToken from "./FromToken";
import ToToken from "./ToToken";
import Setting from '../component/Setting';

import PANCAKE_ABI from "../abi/Router.json";
import WBNB from "../abi/WBNB.json";

import useMetaMask from "../wallet/index";

function getRPCErrorMessage(error) {
    const start = error.message.indexOf("{");   
    const end = error.message.indexOf("}");
    if (start && end) {
        error = JSON.parse(error.message.substring(start, end + 1));
    }

    return error;
}

function Swap() {

    const { library, account, isActive, chainId } = useMetaMask();
    var web3Obj = library;
    var Router = "0x10ED43C718714eb63d5aA57B78B54704E256024E";

    const [fromModal, setFromModal] = useState(false);
    const [toModal, setToModal] = useState(false);

    const [tokenInfo, setTokenInfo] = useState([]);

    const [fromToken, setFromToken] = useState({});
    const [fromAmount, setFromAmount] = useState("");
    const [toToken, setToToken] = useState("");
    const [toAmount, setToAmount] = useState(0);

    const [fromBalance, setFromBalance] = useState(0);
    const [toBalance, setToBalance] = useState(0);

    const [slippage, setSlippage] = useState(0.5);
    const [deadLine, setDeadLine] = useState(20);
    const [swapActive, setSwapActive] = useState(false);
    const [isAllowance, setIsAllowance] = useState(true);
    const [loading, setLoadding] = useState(true);

    const [isBscNetwork, setIsBscNetwork] = useState(false);

    const successAlert = (tx) => {
        return (
            <div>
                <p>Transaction Successful</p>
                {/* <br /> */}
                <a target="_blank" href={`https://bscscan.com/tx/${tx}`}>
                    View on Explorer
                </a>
            </div>
        );
    };

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
        setLoadding(true);
        try {
            if (!fromToken.address) {
                return;
            }
            var contract = new web3Obj.eth.Contract(WBNB, fromToken.address);
            var amountIn = 10 ** 69;
            amountIn = amountIn.toLocaleString("fullwide", { useGrouping: false });

            await contract.methods
                .approve(Router, amountIn.toString())
                .send({ from: account });
            setLoadding(false);
            setIsAllowance(false);
        } catch (err) {
            setLoadding(false);
        }
    };

    const quateSwap = async (e) => {
        setLoadding(true);
        try {
            setFromAmount(e.target.value);
            setIsAllowance(true);
            var fromAmount = e.target.value;

            if (!fromToken || !toToken || fromAmount <= 0) {
                setLoadding(false);
                return;
            }

            var fromTokenContract = new web3Obj.eth.Contract(WBNB, fromToken.address);
            var fromTokenDecimals = await fromTokenContract.methods.decimals().call();
            var allowance = await fromTokenContract.methods
                .allowance(account, Router)
                .call();

            var amountIn = parseFloat(fromAmount) * 10 ** fromTokenDecimals;
            amountIn = amountIn.toLocaleString("fullwide", { useGrouping: false });

            var toAddressContract = new web3Obj.eth.Contract(WBNB, toToken.address);
            var toAddressDecimals = await toAddressContract.methods.decimals().call();

            var contract = new web3Obj.eth.Contract(PANCAKE_ABI, Router);
            var WETH = await contract.methods.WETH().call();

            if (parseFloat(amountIn) < allowance) {
                console.log(allowance);
                setIsAllowance(false);
            }
            if (fromToken.address === WETH) {
                setIsAllowance(false);
            }

            if (fromToken.address === WETH) {
                var amountsOut = await contract.methods
                    .getAmountsOut(`${amountIn}`, [WETH, toToken.address])
                    .call();

                var outputAmount = amountsOut[1] / 10 ** toAddressDecimals;
            } else if (toToken.address === WETH) {
                var amountsOut = await contract.methods
                    .getAmountsOut(`${amountIn}`, [fromToken.address, WETH])
                    .call();
                var outputAmount = amountsOut[1] / 10 ** toAddressDecimals;
            } else {
                var amountsOut = await contract.methods
                    .getAmountsOut(`${amountIn}`, [
                        fromToken.address,
                        WETH,
                        toToken.address,
                    ])
                    .call();
                var outputAmount = amountsOut[2] / 10 ** toAddressDecimals;
            }
            setToAmount(outputAmount);
            setSwapActive(true);

            setLoadding(false);
        } catch (err) {
            setLoadding(false);
        }
    };

    const estimateSwap = async (e) => {
        setLoadding(true);
        var fromTokenContract = new web3Obj.eth.Contract(WBNB, fromToken.address);
        var fromTokenDecimals = await fromTokenContract.methods.decimals().call();

        var toAddressContract = new web3Obj.eth.Contract(WBNB, toToken.address);
        var toAddressDecimals = await toAddressContract.methods.decimals().call();

        var contract = new web3Obj.eth.Contract(PANCAKE_ABI, Router);
        var WETH = await contract.methods.WETH().call();

        var pow = Math.pow(10, fromTokenDecimals);
        var amountIn = parseFloat(fromAmount) * pow;
        amountIn = amountIn.toLocaleString("fullwide", { useGrouping: false });

        if (fromToken.address === WETH) {
            var amountsOut = await contract.methods
                .getAmountsOut(`${amountIn}`, [WETH, toToken.address])
                .call();
            var amountOutMin = (
                amountsOut[1] -
                amountsOut[1] * (parseFloat(slippage) / 100)
            ).toFixed(0);
        } else if (toToken.address === WETH) {
            var amountsOut = await contract.methods
                .getAmountsOut(`${amountIn}`, [fromToken.address, WETH])
                .call();
            var amountOutMin = (
                amountsOut[1] -
                amountsOut[1] * (parseFloat(slippage) / 100)
            ).toFixed(0);
        } else {
            var amountsOut = await contract.methods
                .getAmountsOut(`${amountIn}`, [
                    fromToken.address,
                    WETH,
                    toToken.address,
                ])
                .call();
            var amountOutMin = (
                amountsOut[2] -
                amountsOut[2] * (parseFloat(slippage) / 100)
            ).toFixed(0);
        }

        try {
            if (fromToken.address === WETH) {
                await contract.methods
                    .swapExactETHForTokens(
                        // amountIn,
                        amountOutMin.toString(),
                        [fromToken.address, toToken.address],
                        account,
                        Date.now() + 1000 * 60 * parseInt(deadLine) //20 minutes
                    )
                    .estimateGas({ from: account, value: amountIn.toString() })
                    .then(async () => {
                        await contract.methods
                            .swapExactETHForTokens(
                                // amountIn,
                                amountOutMin.toString(),
                                [fromToken.address, toToken.address],
                                account,
                                Date.now() + 1000 * 60 * parseInt(deadLine) //20 minutes
                            )
                            .send({ from: account, value: amountIn.toString() })
                            .then((result) => {
                                notify(false, successAlert(result.transactionHash));
                            })
                            .catch((er) => notify(true, er.message));
                    });
            } else if (toToken.address === WETH) {
                var tx = await contract.methods
                    .swapExactTokensForETH(
                        amountIn.toString(),
                        amountOutMin.toString(),
                        [fromToken.address, toToken.address],
                        account,
                        Date.now() + 1000 * 60 * parseInt(deadLine) //20 minutes
                    )
                    .estimateGas({ from: account })
                    .then(async () => {
                        await contract.methods
                            .swapExactTokensForETH(
                                amountIn.toString(),
                                amountOutMin.toString(),
                                [fromToken.address, toToken.address],
                                account,
                                Date.now() + 1000 * 60 * parseInt(deadLine) //20 minutes
                            )
                            .send({ from: account })
                            .then((result) => {
                                notify(false, successAlert(result.transactionHash));
                            })
                            .catch((er) => notify(true, er.message));
                    });
            } else {
                var tx = await contract.methods
                    .swapExactTokensForTokens(
                        amountIn.toString(),
                        amountOutMin.toString(),
                        [fromToken.address, WETH, toToken.address],
                        account,
                        Date.now() + 1000 * 60 * parseInt(deadLine) //20 minutes
                    )
                    .estimateGas({ from: account })
                    .then(async () => {
                        await contract.methods
                            .swapExactTokensForTokens(
                                amountIn.toString(),
                                amountOutMin.toString(),
                                [fromToken.address, WETH, toToken.address],
                                account,
                                Date.now() + 1000 * 60 * parseInt(deadLine) //20 minutes
                            )
                            .send({ from: account })
                            .then((result) => {
                                notify(false, successAlert(result.transactionHash));
                            })
                            .catch((er) => notify(true, er.message));
                    });
            }
            setLoadding(false);
        } catch (err) {
            var error = getRPCErrorMessage(err);

            if (error.message === "execution reverted: Pancake: K") {
                try {
                    if (toToken.address === WETH) {
                        await contract.methods
                            .swapExactTokensForETHSupportingFeeOnTransferTokens(
                                amountIn.toString(),
                                amountOutMin.toString(),
                                [fromToken.address, toToken.address],
                                account,
                                Date.now() + 1000 * 60 * parseInt(deadLine) //20 minutes
                            )
                            .estimateGas({ from: account })
                            .then(async () => {
                                await contract.methods
                                    .swapExactTokensForETHSupportingFeeOnTransferTokens(
                                        amountIn.toString(),
                                        amountOutMin.toString(),
                                        [fromToken.address, toToken.address],
                                        account,
                                        Date.now() + 1000 * 60 * parseInt(deadLine) //20 minutes
                                    )
                                    .send({ from: account })
                                    .then((result) => {
                                        notify(false, successAlert(result.transactionHash));
                                    })
                                    .catch((er) => notify(true, er.message));
                            });
                    } else {
                        await contract.methods
                            .swapExactTokensForTokensSupportingFeeOnTransferTokens(
                                amountIn.toString(),
                                amountOutMin.toString(),
                                [fromToken.address, WETH, toToken.address],
                                account,
                                Date.now() + 1000 * 60 * parseInt(deadLine) //20 minutes
                            )
                            .estimateGas({ from: account })
                            .then(async () => {
                                await contract.methods
                                    .swapExactTokensForTokensSupportingFeeOnTransferTokens(
                                        amountIn.toString(),
                                        amountOutMin.toString(),
                                        [fromToken.address, WETH, toToken.address],
                                        account,
                                        Date.now() + 1000 * 60 * parseInt(deadLine) //20 minutes
                                    )
                                    .send({ from: account })
                                    .then((result) => {
                                        notify(false, successAlert(result.transactionHash));
                                    })
                                    .catch((er) => notify(true, er.message));
                            });
                    }
                    setLoadding(false);
                } catch (err) {
                    var getError = getRPCErrorMessage(err);
                    if (
                        getError.message ===
                        "execution reverted: PancakeRouter: INSUFFICIENT_OUTPUT_AMOUNT"
                    ) {
                        notify(
                            true,
                            "This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance."
                        );
                    }

                    setLoadding(false);
                }
            } else {
                notify(
                    true,
                    "This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance."
                );
                setLoadding(false);
            }
        }
    };

    const getTokenBalance = async (tokenAddress, type) => {
        try {
            if (type === "From") {
                if (tokenAddress === "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c") {
                    var result = await web3Obj.eth.getBalance(account);
                    var format = web3Obj.utils.fromWei(result); // 29803630.997051883414242659
                    setFromBalance(parseFloat(format).toFixed(10));
                } else {
                    var tokenContract = new web3Obj.eth.Contract(WBNB, tokenAddress);
                    var decimals = await tokenContract.methods.decimals().call();
                    var getBalance = await tokenContract.methods
                        .balanceOf(account)
                        .call();

                    var pow = 10 ** decimals;
                    var balanceInEth = getBalance / pow;
                    setFromBalance(balanceInEth);
                }
            } else {
                if (tokenAddress === "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c") {
                    var result = await web3Obj.eth.getBalance(account);
                    var format = web3Obj.utils.fromWei(result); // 29803630.997051883414242659
                    setToBalance(parseFloat(format).toFixed(10));
                } else {
                    var tokenContract = new web3Obj.eth.Contract(WBNB, tokenAddress);
                    var decimals = await tokenContract.methods.decimals().call();
                    var getBalance = await tokenContract.methods
                        .balanceOf(account)
                        .call();

                    var pow = 10 ** decimals;
                    var balanceInEth = getBalance / pow;
                    setToBalance(balanceInEth);
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    const rotateSwap = async () => {
        var fromtemp = fromToken;
        var totemp = toToken;
        setFromToken(totemp);
        setToToken(fromtemp);
        setFromAmount("");
        setToAmount(0);
        if (isActive) {
            getTokenBalance(totemp.address, "From");
            getTokenBalance(fromtemp.address, "To");
        }
    }

    const switchNetwork = async () => {
        setLoadding(true);
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x38" }], // chainId must be in hexadecimal numbers
        });
        setLoadding(false);
    };

    useEffect(() => {
        if (isActive) {
            if (chainId !== 56) {
                setIsBscNetwork(false);
            } else {
                if (fromToken?.address) {
                    setIsBscNetwork(true);
                    getTokenBalance(fromToken.address, "From");
                    getTokenBalance(toToken.address, "To");
                }
            }
        }
    }, [chainId]);

    useEffect(() => {
        setLoadding(true);
        var token = tokenList();
        if (token) {
            setTokenInfo(token);
            if (isActive) {
                if (chainId !== 56) {
                    setIsBscNetwork(false);
                } else {
                    getTokenBalance(token[0].address, "From");
                    getTokenBalance(token[1].address, "To");
                    setIsBscNetwork(true);
                }
            }
            setFromToken(token[0]);
            setToToken(token[1]);
        }
        setLoadding(false);
    }, [isActive]);

    return (
        <div>
            <div className="page-wrapper">

                <div className="content container-fluid">
                    <div className='heading-title'>Swap</div>
                    <div className="row justify-content-center align-items-center">

                        <div className="tabs-wrapper">
                            <div className='checkout-form-centre' style={{ padding: '9px 0px 50px 0px' }}>
                                <div className='checkout-login-step'>
                                    <div className='lock-title'>Swap </div>

                                    <div className='setting-icon'>
                                        <i class="fa fa-clock-o" aria-hidden="true" style={{ marginRight: '15px' }}></i>
                                        <i class="fa fa-sliders" aria-hidden="true" data-toggle="modal" data-target="#exampleModal1"></i>
                                        <Setting setSlippage={setSlippage} setDeadLine={setDeadLine} />
                                    </div>

                                    <div className='lock-box'>
                                        <div className='left' >
                                            <div className='from'>from :</div>
                                            <div className='token-name' onClick={() => setFromModal(true)}>
                                                <div className='name'>{fromToken.symbol}</div>
                                                <img src={fromToken.logo} alt="" />
                                                <i className="fa fa-angle-down"></i>
                                            </div>
                                        </div>
                                        <FromToken
                                            setFromModal={setFromModal}
                                            fromModal={fromModal}
                                            tokenInfo={tokenInfo}
                                            setTokenInfo={setTokenInfo}
                                            setFromToken={setFromToken}
                                            getTokenBalance={getTokenBalance}
                                            quateSwap={quateSwap}
                                            fromAmount={fromAmount}
                                        />

                                        <ToToken
                                            setToModal={setToModal}
                                            toModal={toModal}
                                            tokenInfo={tokenInfo}
                                            setTokenInfo={setTokenInfo}
                                            setToToken={setToToken}
                                            getTokenBalance={getTokenBalance}
                                            quateSwap={quateSwap}
                                            fromAmount={fromAmount}
                                        />


                                        <div className='right'>
                                            <div className='to'>Balance : {parseFloat(fromBalance).toFixed(10)}</div>
                                            <div className='token-box'>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="inputName"
                                                    value={fromAmount}
                                                    onChange={(e) => {
                                                        quateSwap(e);
                                                    }}
                                                    placeholder='0' />
                                                <button type='button' className='max' onClick={(e) => {
                                                    setFromAmount(fromBalance);
                                                    e.target.value = fromBalance;
                                                    quateSwap(e);
                                                }}>Max</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='swap-icon'>
                                        <button type='button' onClick={() => rotateSwap()}><i className="fa fa-arrow-down"></i></button>
                                    </div>

                                    <div className='lock-box'>
                                        <div className='left'>
                                            <div className='from'>To :</div>
                                            <div className='token-name' onClick={() => setToModal(true)}>                                                
                                                <div className='name'>{toToken.symbol}</div>
                                                <img src={toToken.logo} />
                                                <i className="fa fa-angle-down"></i>
                                            </div>
                                        </div>

                                        <div className='right'>
                                            <div className='to'>Balance : {parseFloat(toBalance).toFixed(10)}</div>
                                            <div className='token-box'>
                                                
                                                <input type="text" className="form-control" id="inputName" value={parseFloat(toAmount).toFixed(9)} readOnly />
                                                <button type='button' className='max' >Max</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='swap-details'>
                                        <div className='swap-left'>
                                            <h6>Slippage :</h6>
                                            <p>{slippage} %  <i className="fa fa-exclamation-circle" aria-hidden="true"></i></p>
                                        </div>
                                        {/* <div className='swap-left'>
                                            <h6>Pool Share Estimated :</h6>
                                            <p>12% <i className="fa fa-exclamation-circle" aria-hidden="true"></i></p>
                                        </div>
                                        <div className='swap-left'>
                                            <h6>BNB Fee :</h6>
                                            <p>0,00175 BNB <i className="fa fa-exclamation-circle" aria-hidden="true"></i></p>
                                        </div>
                                        <div className='swap-left'>
                                            <h6>Total Fee :</h6>
                                            <p>$0,7123 <i className="fa fa-exclamation-circle" aria-hidden="true"></i></p>
                                        </div> */}
                                    </div>

                                    {!isBscNetwork ?
                                        <button type='button' className='lock-btn' disabled={loading} onClick={() => switchNetwork()}>
                                            {loading ? "Please wait, Loading..." : "Swich to BSC network"}
                                        </button> :
                                        !swapActive ?
                                            <button type='button' disabled={true} className='lock-btn'>
                                                {loading ? "Please wait, Loading.." : "Enter an amount"}
                                            </button> :
                                            isAllowance ?
                                                <button disabled={loading} onClick={() => approve()} type='button' className='lock-btn'>
                                                    {loading ? "Please wait, Loading.." : "Enable"}
                                                </button> :
                                                <button disabled={loading} onClick={() => estimateSwap()} type='button' className='lock-btn'>
                                                    {loading ? "Please wait, Loading.." : "Swap"}
                                                </button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <ToastContainer />
            </div>
        </div>
    )
}

export default Swap