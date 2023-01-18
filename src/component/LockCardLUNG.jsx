import React, { useState, useEffect } from 'react'
import "./Lock.css";
import DataTable, { createTheme } from 'react-data-table-component';

import ROUTER_API from "../abi/Farming.json";
import WBNB from "../abi/WBNB.json";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import useMetaMask from "../wallet/index";
import moment from "moment";

function secondsToDhms(seconds) {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor(seconds % (3600 * 24) / 3600);
  var m = Math.floor(seconds % 3600 / 60);

  var dDisplay = d > 0 ? d + (d == 1 ? " Day " : " Day ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " Hour " : " Hour ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " Min, " : " Min ") : "";
  return dDisplay + hDisplay + mDisplay;
}

function Lock(props) {

  const { library, account, isActive, chainId } = useMetaMask()
  var Router = '0x0F008480DDC18b6BaC65863dCd4ebbEa0716E572'

  const [rewardToken, setRewardToken] = useState("")
  const [rewardTokenDecimal, setRewardTokenDecimal] = useState(18)
  const [packageList, setPackageList] = useState([])
  const [farmList, setFarmList] = useState([])

  const [neuraAmount, setNeuraAmount] = useState("")
  const [nativeAmount, setNativeAmount] = useState("")
  const [timeperiod, setTimeperiod] = useState(0)

  const [lockAmt, setLockAmt] = useState(0)
  // const [flexibleAmt, setFlexibleAmt] = useState(0);

  const [nativeBalance, setNativeBalance] = useState(0);
  const [metaBalance, setMetaBalance] = useState(0);

  const [isAllowance, setIsAllowance] = useState(true);
  const [loading, setLoadding] = useState(false);

  const [isBscNetwork, setIsBscNetwork] = useState(false);

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
      var contract = new library.eth.Contract(WBNB, rewardToken);
      var amountIn = 10 ** 75;
      amountIn = amountIn.toLocaleString("fullwide", { useGrouping: false });

      await contract.methods
        .approve(Router, amountIn.toString())
        .send({ from: account });

      setIsAllowance(false);
      setLoadding(false);
    } catch (err) {
      setLoadding(false);
      notify(true, err.message);
    }
  };

  const createPackageFarm = async (e) => {
    setLoadding(true);
    try {
      var contract = new library.eth.Contract(ROUTER_API, Router);
      await contract.methods
        .createPackageFarm(e.index, e.tokenAmount.toString())
        .send({ from: account, value: e.nativeAmount });

      await loadUserData();
      notify(false, "Transaction success");
    } catch (err) {
      setLoadding(false);
      notify(true, err.message);
    }
  };

  const createLockFarm = async () => {
    setLoadding(true);
    try {
      var contract = new library.eth.Contract(ROUTER_API, Router);
      await contract.methods
        .createLockFarm(timeperiod, neuraAmount.toString())
        .send({ from: account, value: nativeAmount });

      await loadUserData();
      notify(false, "Transaction success");
    } catch (err) {
      setLoadding(false);
      notify(true, err.message);
    }
  };

  const createFlexbleFarm = async () => {
    setLoadding(true);
    try {
      var contract = new library.eth.Contract(ROUTER_API, Router);
      await contract.methods
        .createFlexbleFarm(neuraAmount.toString())
        .send({ from: account, value: nativeAmount });

      await loadUserData();
      notify(false, "Transaction success");
    } catch (err) {
      setLoadding(false);
      notify(true, err.message);
    }

  };

  const harvest = async (index) => {
    setLoadding(true);
    try {
      var contract = new library.eth.Contract(ROUTER_API, Router);
      await contract.methods
        .harvest(index)
        .send({ from: account });

      notify(false, "Harvested successfully");
      await loadUserData();
    } catch (err) {
      setLoadding(false);
      notify(true, err.message);
    }
  };

  const withdraw = async (index) => {
    setLoadding(true);
    try {
      var contract = new library.eth.Contract(ROUTER_API, Router);
      await contract.methods
        .withdraw(index)
        .send({ from: account });

      await loadUserData();
      notify(false, "Withdraw successfully");
    } catch (err) {
      notify(true, err.message);
    }

    setLoadding(false);
  };

  const loadUserData = async () => {

    setLoadding(true);
    const contract = new library.eth.Contract(ROUTER_API, Router);
    const tokenAddr = await contract.methods.tokenAddr().call();

    var nativeBalance = await library.eth.getBalance(account);
    setNativeBalance(parseFloat(nativeBalance) / Math.pow(10, 18));

    const tokenContract = new library.eth.Contract(WBNB, tokenAddr);
    const decimals = await tokenContract.methods.decimals().call();

    var metaBalance = await tokenContract.methods.balanceOf(account).call();
    var tempBal = parseFloat(metaBalance) / Math.pow(10, decimals)
    setMetaBalance(tempBal - 0.0000000010);

    setRewardTokenDecimal(decimals);
    setRewardToken(tokenAddr);
    var allowance = await tokenContract.methods
      .allowance(account, Router)
      .call();

    if (allowance > 2) {
      setIsAllowance(false);
    }

    const totalPackage = await contract.methods.totalPackage().call();
    var packageList = [];
    for (var i = 0; i < parseInt(totalPackage); i++) {
      const Package = await contract.methods.Package(i).call();
      packageList.push(Package);
    }
    setPackageList(packageList);

    const Farmers = await contract.methods.Farmers(account).call();
    var farmList = [];
    for (var i = 0; i < parseFloat(Farmers.farmCount); i++) {
      var farmingRecord = await contract.methods.farmingRecord(account, i).call();
      var realtimeRewardPerBlock = await contract.methods.realtimeRewardPerBlock(account, i).call();
      farmingRecord.earnReward = realtimeRewardPerBlock[0];
      farmingRecord.index = i;
      farmList.push(farmingRecord);
    }
    setFarmList(farmList.reverse());
    setLoadding(false);
  };

  const getRatio = async (val) => {

    const contract = new library.eth.Contract(ROUTER_API, Router);

    var amt = val * Math.pow(10, rewardTokenDecimal);
    amt = amt.toLocaleString("fullwide", { useGrouping: false });
    var ratio = await contract.methods.getRatio(amt).call();

    setNeuraAmount(amt)
    setNativeAmount(ratio);
  }

  const switchNetwork = async () => {
    setLoadding(true);
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x38" }], // chainId must be in hexadecimal numbers
    });
  };

  useEffect(() => {
    if (isActive) {
      if (chainId !== 56) {
        setIsBscNetwork(false);
      } else {
        loadUserData();
        setIsBscNetwork(true);
      }
    }
  }, [isActive, chainId]);

  const tab = () => {
    const tabs = document.querySelectorAll('[data-role="tab"]'),
      tabContents = document.querySelectorAll(".tab-panel");

    setNativeAmount("");
    setNeuraAmount("");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = document.querySelector(tab.dataset.target);

        tabContents.forEach((tc) => {
          tc.classList.remove("is-active");
        });
        target.classList.add("is-active");

        tabs.forEach((t) => {
          t.classList.remove("is-active");
        });
        tab.classList.add("is-active");
      });
    });
  }

  // start datatable
  createTheme('solarized', {
    text: {
      primary: '#ffffff',
      secondary: '#2aa198',
    },
    background: {
      default: 'Transparent',
    },
    context: {
      background: '#cb4b16',
      text: '#FFFFFF',
    },
    divider: {
      default: '#23323c',
    },
    action: {
      button: 'rgba(0,0,0,.54)',
      hover: 'rgba(0,0,0,.08)',
      disabled: 'rgba(0,0,0,.12)',
    },
  }, 'dark');

  const columns = [
    {
      name: 'BNB',
      selector: row => parseFloat(row.nativeamount / Math.pow(10, 18)).toFixed(8),
      sortable: true,
    },
    {
      name: 'DRM',
      // selector: row => row.director,
      selector: row => row.tokenamount / Math.pow(10, rewardTokenDecimal),
      sortable: true,
    },
    {
      name: 'Date',
      selector: row => moment.unix(row.staketime).utc().format("YYYY-MM-DD H:mm:ss A"),
      sortable: true,
    },
    {
      name: 'Locking Periode',
      selector: row => row.lockingtime === 0 ? "-" : secondsToDhms(row.lockingtime),
      sortable: true,
    },
    {
      name: 'Withdraw Date',
      selector: row => parseInt(row.lockingtime) === 0 ? "-" : moment.unix(row.staketime).add(row.lockingtime, 'seconds').utc().format("YYYY-MM-DD H:mm:ss A"),
      sortable: true,
    },
    {
      name: 'Earn Reward',
      selector: row => parseFloat(row.earnReward / Math.pow(10, rewardTokenDecimal)).toFixed(8),
      sortable: true,
    },
    {
      name: 'Harvest',
      cell: row => <button disabled={loading} onClick={() => harvest(row.index)} className="table-btn">Harvest</button>,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: 'Withdraw',
      cell: row => <button disabled={loading} onClick={() => withdraw(row.index)} className="table-btn">Remove LP</button>,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];
  // End datatable

  // const [buttonState, setState] = useState()

  return (
    <div>
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className='heading-title'>Earning</div>
          <div className="row justify-content-center align-items-center">
            <div className="tabs-wrapper">
              <ul className="nav-tabs" role="tablist">
                <div>
                  <li className="nav-item tab is-active" data-role="tab" data-target="#tabs-home3" onClick={tab}>Staking</li>
                  <p style={{color: 'white', marginLeft: '25%', marginTop: '15px'}}>{ props.tokenName == 'LUNG' && 'Upcoming!' }</p>
                </div>

                {/* <li className="nav-item tab" data-role="tab" data-target="#tabs-profile3" onClick={tab}>Flexible
                </li> */}

                {/* <li className="nav-item tab" data-role="tab" data-target="#tabs-messages3" onClick={tab}>package
                </li> */}
              </ul>
              <div className="tab-content">
                <div className="tab-panel is-active" id="tabs-home3" role="tabpanel">
                  <div className='checkout-form-centre'>
                    <div className='checkout-login-step'>
                      {/* <div className='lock-title'>Locking Period</div> */}
                      <div className='lock-box'>
                        <div className='left'>
                          <div className='from'>from :</div>
                          <div className='token-name'>
                            <div className='name'>{props.tokenName}</div>
                            { props.tokenName === 'LUNG' ? (
                              <img src={props.logo} alt="lunagens logo" className='logo-width' />
                            ) : (
                              <img src={props.logo} alt="daorium logo" className='logo-width' />
                            ) }
                          </div>
                        </div>

                        <div className='right'>
                          <div className='to'>Balance : {metaBalance.toFixed(9)}</div>
                          <div className='token-box'>
                            <input type="text" className="form-control" id="inputName" placeholder='0.0' value={lockAmt} onChange={(e) => { setLockAmt(e.target.value); getRatio(e.target.value) }} />
                            <button type='button' className='max' onClick={() => { setLockAmt(metaBalance); getRatio(metaBalance) }}>Max</button>
                          </div>
                        </div>
                      </div>

                      <div className='swap-icon'>
                        <button type='button'><i className="fa fa-arrow-down"></i></button>
                      </div>
                      <div className='lock-box'>
                        <div className='left'>
                          <div className='from'>To :</div>
                          <div className='token-name'>
                            <div className='name'>BNB</div>
                            <img src="images/bnb.png" />
                          </div>
                        </div>

                        <div className='right'>
                          <div className='to'>Balance : {nativeBalance.toFixed(9)}</div>
                          <div className='token-box'>
                            <input type="text" className="form-control" id="inputName" value={parseFloat(nativeAmount / Math.pow(10, 18)).toFixed(8)} style={{width:"320px"}} />
                            {/* <button type='button' className='max' style={{ textAlign: 'right', float: 'right' }}>Max</button> */}
                          </div>
                        </div>
                      </div>

                      <div className='btn-section'>
                        <button type='button' onClick={() => setTimeperiod(0)} className={timeperiod === 0 ? "days active" : "days"}>7 days</button>
                        <button type='button' onClick={() => setTimeperiod(1)} className={timeperiod === 1 ? "days active" : "days"}>30 days</button>
                        <button type='button' onClick={() => setTimeperiod(2)} className={timeperiod === 2 ? "days active" : "days"}>60 days</button>
                        <button type='button' onClick={() => setTimeperiod(3)} className={timeperiod === 3 ? "days active" : "days"}>90 days</button>
                        <button type='button' onClick={() => setTimeperiod(4)} className={timeperiod === 4 ? "days active" : "days"}>180 days</button>

                      </div>
                      <div className='apy'>
                        {timeperiod === 0 ? `APY up to 25%, Locked Until ${moment().add(30, "days").format("DD-MM-YYYY H:mm A")}`
                          : timeperiod === 1 ? `APY up to 30%, Locked Until ${moment().add(60, "days").format("DD-MM-YYYY H:mm A")}`
                            : timeperiod === 2 ? `APY up to 35%, Locked Until ${moment().add(90, "days").format("DD-MM-YYYY H:mm A")}`
                              : timeperiod === 3 ? `APY up to 40%, Locked Until ${moment().add(180, "days").format("DD-MM-YYYY H:mm A")}`
                                : `APY up to 45%, Locked Until ${moment().add(365, "days").format("DD-MM-YYYY H:mm A")}`
                        }</div>

                      {isBscNetwork ?
                        isAllowance ?
                          <button disabled={loading} onClick={() => approve()} type='button' className='lock-btn'>
                            {loading ? "loading.." : "Enable"}
                          </button>
                          : <button disabled={loading} onClick={() => createLockFarm()} type='button' className='lock-btn'>
                            {loading ? "loading.." : "ADD"}
                          </button>
                        : <button disabled={loading} onClick={() => switchNetwork()} type='button' className='lock-btn'>
                          {loading ? "loading.." : "Swich to BSC network"}
                        </button>
                      }
                    </div>
                  </div>
                </div>
                <div className="tab-panel" id="tabs-profile3" role="tabpanel">
                  <div className='checkout-form-centre'>
                    <div className='checkout-login-step'>
                      <div className='lock-title'>Farming Flexible</div>
                      <div className='lock-box'>
                        <div className='left'>
                          <div className='from'>from :</div>
                          <div className='token-name'>
                            <div className='name'>DRM</div>
                            <img src="images/daorium-logo.png" alt="" />
                          </div>
                        </div>

                        <div className='right'>
                          <div className='to'>Balance : {metaBalance.toFixed(9)}</div>
                          <div className='token-box'>
                            <input type="text" className="form-control" id="inputName" placeholder='0.0' onChange={(e) => getRatio(e.target.value)} />
                            <button type='button' className='max'>Max</button>
                          </div>
                        </div>
                      </div>

                      <div className='swap-icon'>
                        <button type='button'><i className="fa fa-arrow-down"></i></button>


                      </div>
                      <div className='lock-box'>

                        <div className='left'>
                          <div className='from'>To :</div>
                          <div className='token-name'>
                            <div className='name'>BNB</div>
                            <img src="images/bnb.png" />
                          </div>
                        </div>

                        <div className='right'>
                          <div className='to'>Balance : {nativeBalance.toFixed(9)}</div>
                          <div className='token-box'>
                            <input type="text" className="form-control" id="inputName" value={parseFloat(nativeAmount / Math.pow(10, 18)).toFixed(8)} />
                            <button type='button' className='max' style={{ textAlign: 'right', float: 'right' }}>Max</button>
                          </div>
                        </div>
                      </div>

                      <div className='apy'>APY Upto 27%, You can withdraw anytime.</div>

                      {isAllowance ?
                        <button disabled={loading} onClick={() => approve()} type='button' className='lock-btn'>
                          {loading ? "loading" : "Enable"}</button>
                        : <button disabled={loading} onClick={() => createFlexbleFarm()} type='button' className='lock-btn'>
                          {loading ? "loading.." : "ADD"}</button>
                      }

                    </div>
                  </div>
                </div>
                <div className="tab-panel" id="tabs-messages3" role="tabpanel">
                  <div className='checkout-form-centre'>
                    <div className='checkout-login-step'>
                      <div className='lock-title'>Farming Package</div>
                      <div className='package-table'>
                        <table class="table-responsive" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                          <thead>
                            <tr>
                              <th style={{ width: '200px' }} scope="col">BNB</th>
                              <th style={{ width: '200px' }} scope="col">DRM</th>
                              <th style={{ width: '200px' }} scope="col">Reward</th>
                              <th style={{ width: '200px' }} scope="col">Locking</th>
                              <th style={{ width: '200px' }} scope="col"></th>

                            </tr>
                          </thead>
                          <tbody>

                            { packageList.length > 0 ? 
                            packageList.map((e, key) => {
                              e.index = key;
                              return (e.active ?
                                <tr scope="row" style={{ width: '200px' }} key={key}>
                                  <td style={{ width: '200px' }}>{parseFloat(e.nativeAmount) / Math.pow(10, 18)}</td>
                                  <td style={{ width: '200px' }}>{parseFloat(e.tokenAmount) / Math.pow(10, rewardTokenDecimal)}</td>
                                  <td style={{ width: '200px' }}>{parseFloat(e.rewardTokenAmount) / Math.pow(10, rewardTokenDecimal)}</td>
                                  <td style={{ width: '200px' }}>{secondsToDhms(e.lockingPeriod)}</td>
                                  <td style={{ width: '200px' }}>
                                    {isAllowance ?
                                      <button disabled={loading} onClick={() => approve()} type='button' className='btn-add'>
                                        {loading ? "loading" : "Enable"}
                                      </button>
                                      : <button disabled={loading} onClick={() => createPackageFarm(e)} type='button' className='btn-add'>
                                        {loading ? "loading" : "Add"}
                                      </button>
                                    }
                                  </td>
                                </tr> : "")
                            }) 

                            :
                            <tr scope="row" style={{ width: '200px' }} >
                               <td style={{ width: '200px',textAlign:"center" }} colSpan={5}> No Package Found</td>
                            </tr>
                          
                          }

                          </tbody>
                        </table>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>

        <div className='table-section'>
          <div className='col-lg-12'>
            <div className='tbl'>
              <DataTable
                columns={columns}
                theme="solarized"
                data={farmList}
              />
            </div>
          </div>
        </div>

      </div>
      <ToastContainer />
    </div>
  )

}

export default Lock


