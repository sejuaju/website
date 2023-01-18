import React from "react";
import { Link } from "react-router-dom";
function Sidebar() {
  return (
    <div className="sidebar" id="sidebar">
      <div className="sidebar-inner slimscroll">
        <div id="sidebar-menu" className="sidebar-menu">
          <ul>
            <li>
              <Link to="/development">
                {" "}
                <img src="images/Home.png" alt="" />
                <span>Home</span>
              </Link>
            </li>
            <li></li>
            <li>
              <Link to="/development">
                <img src="images/Paper.png" alt="" />
                <span>Launchpad</span>
              </Link>
            </li>

            <li>
              <Link to="/development">
                {" "}
                <img src="images/Daorium-1.png" alt="" />
                <span>explore</span>
              </Link>
            </li>
            <li className="divider"></li>
            <li>
              <Link to="/development">
                <img src="images/wallet.png" alt="" />
                <span>Wallet</span>
              </Link>
            </li>

            <li className="submenu">
              <a href="">
                <img src="images/Graph.png" alt="" />
                <span> Earn </span> <span className="menu-arrow"></span>
              </a>
              <ul style={{ display: "none" }}>
                <li className="text-black">
                  <Link to="/">FARM</Link>
                </li>
                <li className="text-black">
                  <a href="https://daorium.link">STAKING</a>
                </li>
              </ul>
            </li>
            <li className="submenu">
              <a href="#">
                {" "}
                <img src="images/delete.png" alt="" />
                <span> Trade </span> <span className="menu-arrow"></span>
              </a>
              <ul style={{ display: "none" }}>
                <li>
                  <Link to="/swap">Swap</Link>
                </li>
              </ul>
            </li>
            <li></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
