import React from 'react';
import "./Setting.css";
function Setting({ setSlippage, setDeadLine }) {
    const NumericOnly = (e) => {
        const reg = /^[0-9\b]+$/
        let preval = e.target.value
        if (e.target.value === '' || reg.test(e.target.value)) return true
        else e.target.value = preval.substring(0, (preval.length - 1))
    }
    return (
        <div>

            <div className="modal fade" id="exampleModal1" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel1" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Settings</h4>
                            <button type="button" className="close" data-dismiss="modal">&times;</button>
                        </div>
                        <div className="modal-body" style={{ overflowY: 'auto' }}>
                            <div className="swaps-liquidation">
                                <p>SWAP</p>
                                <h4>Slippage Tolerance
                                </h4>
                                <ul style={{ marginBottom: '30px' }}>
                                    <li><a onClick={() => setSlippage(0.1)}>0.1%</a></li>
                                    <li><a onClick={() => setSlippage(0.5)}>0.5%</a></li>
                                    <li><a onClick={() => setSlippage(1.0)}>1.0%</a></li>
                                    <li>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="1.00 %"
                                            min={1}
                                            max={49}
                                            onChange={(e) => setSlippage(e.target.value)} />
                                    </li>
                                </ul>
                                <div className="details">
                                    <div className="label">Tx deadline (mins)  </div>
                                    <input
                                        type="text"
                                        className="form-control" placeholder="20"
                                        onChange={(e) => setDeadLine(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Setting