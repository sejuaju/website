import React from 'react'

import { tokenList } from "../token/token";

import Web3 from "web3";
import WBNB from "../abi/WBNB.json";

export default function FromToken({
    setFromModal,
    fromModal,
    tokenInfo,
    setTokenInfo,
    setFromToken,
    fromAmount,
    quateSwap,
    getTokenBalance,
}) {

    const searchToken = async (search) => {
        var token = tokenList(search);

        if (token.length === 0) {
            const web3 = new Web3("https://bsc-dataseed1.binance.org/");
            var isAddress = web3.utils.isAddress(search);

            if (isAddress) {
                const contract = new web3.eth.Contract(WBNB, search);
                const name = await contract.methods.name().call();
                const symbol = await contract.methods.symbol().call();
                const decimals = await contract.methods.decimals().call();

                var tokenInfo = [
                    {
                        name: name,
                        address: search,
                        symbol: symbol,
                        decimals: decimals,
                        logo: "/images/information.png",
                    },
                ];

                setTokenInfo(tokenInfo);
            } else {
                setTokenInfo(tokenList(search));
            }
        } else {
            setTokenInfo(tokenList(search));
        }
    };

    return (
        <div>
            <div className={`modal ${fromModal ? "show" : ""}`}

                style={{
                    display: `${fromModal ? "block" : "none"}`,
                }}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Import a Token</h5>
                            <button type="button" className="close" onClick={() => setFromModal(false)} aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className='search'>
                            <span className="fa fa-search form-control-feedback"></span>
                            <input type="search" className="form-control" placeholder='search here..' onChange={(e) => searchToken(e.target.value)} />
                        </div>
                        <div className="modal-body">

                            {tokenInfo.map((row, index) => (
                                <div
                                    className='drp-pop'
                                    key={index} onClick={(e) => {
                                        setFromToken(row);
                                        getTokenBalance(row.address, "From");
                                        setFromModal(false);
                                        setTimeout(function () {
                                            e.target.value = fromAmount;
                                            quateSwap(e);
                                        }, 1000);
                                    }}>
                                    <img src={row.logo} />
                                    <div className='token-name'>
                                        {row.name}
                                        <br />
                                        {row.symbol}
                                        </div>
                                </div>
                            ))}

                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}