import React, { useState } from "react";
import "./Sidebar.scss";
import { HiMenuAlt3 } from "react-icons/hi";
import { RiProductHuntLine } from "react-icons/ri";
import menu from "../../data/sidebar";
import SidebarItem from "./SidebarItem";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(!isOpen);
  const navigate = useNavigate();

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="layout">
      <div
        className="sidebar"
        style={{ width: isOpen ? "230px" : "60px" }}
      >
        <div className="top_section">
          {/* <div className="logo" style={{ display: isOpen ? "block" : "none" }}>
            <RiProductHuntLine
              size={35}
              style={{ cursor: "pointer" }}
              onClick={goHome}
            />
          </div> */}

          <div
            className="menu-title"
            style={{ width: isOpen ? "auto" : "0", opacity: isOpen ? 1 : 0 }}
          >
            <span>Stock Mate</span>
          </div>
          <div className="bars">
            <HiMenuAlt3
              size={24}
              onClick={toggle}
            />
          </div>
        </div>
        {menu.map((item, index) => {
          return (
            <SidebarItem
              key={index}
              item={item}
              isOpen={isOpen}
            />
          );
        })}
      </div>

      <main
        style={{
          paddingLeft: isOpen ? "230px" : "60px",
          transition: "all .5s",
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default Sidebar;
