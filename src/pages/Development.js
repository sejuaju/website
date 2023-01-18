import React from 'react'
import "./Lock.css";
function Development() {
    return (
        <div>
            <div className="page-wrapper">
                <div className="content container-fluid">
                    <div className='heading-title center'>Features under development</div>
                    <div className='development-title'>We will come up with something new</div>
                    <div className="row justify-content-center align-items-center">
                        <div className='development'>
                            <div className='development-step'>
                                <img src="images/development.png" />
                            </div>
                        </div>

                    </div>
                    <div className='col-lg-12 mb-5' style={{ textAlign: 'center' }}>
                        <button type="button" class="lock-btn1">Home</button>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Development