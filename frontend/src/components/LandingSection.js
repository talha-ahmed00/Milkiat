import React from "react";
import "./landingpage.css";
import Navbar from "./Navbar";

function LandingSection() {
  return (
    <div>
      <Navbar />
      <div className="marketplace-container">
        <div className="marketplace-header">
          <p>
            <span className="light__text">
              Welcome to <br />{" "}
            </span>{" "}
            <br />
            <span> Milkiat</span>
          </p>
        </div>
        <div>{/* <PropertyCard /> */}</div>
      </div>
    </div>
  );
}

export default LandingSection;
