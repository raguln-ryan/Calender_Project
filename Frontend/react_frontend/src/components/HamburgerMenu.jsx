import React from "react";

const HamburgerMenu = ({ isOpen, toggleMenu }) => {
  return (
    <button className="hamburger-btn" onClick={toggleMenu}>
      {isOpen ? "✖" : "☰"}
    </button>
  );
};

export default HamburgerMenu;
