import React from "react";
import LockCard from "../component/LockCard";
import LockCardLung from "../component/LockCardLUNG";
import "./Lock.css";
import "../component/responsive.css";
import DRMLogo from "../Daorium-1.png";
import LUNGLogo from "../lunagens.png";

const Lock = () => {
  return (
    <div class="container">
  <div class="row align-items-start">
    <div class="col">
    <div className="lock-card-container">
      <LockCard
        logo={DRMLogo}
        tokenName={"DRM"}
        routerDAO={"0xfF5C65548e5eFa03A108cb645E2Cf2462Fb36d35"} />
    
      
      <div className="lock-card-container">
      <div class="col">
      <LockCard 
      logo={LUNGLogo} tokenName={"LUNG"} routerLUNG={"gaada"} 
      />
 
    </div>
    </div>
    </div>  
    </div>
    </div>
    </div>
    
    
  );
};

export default Lock;
