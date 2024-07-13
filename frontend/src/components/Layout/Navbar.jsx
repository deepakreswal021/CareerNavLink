import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Context } from "../../main";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const { isAuthorized, setIsAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/v1/user/logout",
        {
          withCredentials: true,
        }
      );
      toast.success(response.data.message);
      setIsAuthorized(false);
      navigateTo("/login");
    } catch (error) {
      toast.error(error.response.data.message), setIsAuthorized(true);
    }
  };

  return (
    <nav className={isAuthorized ? "navbarShow" : "navbarHide"}>
      <div className="container">
        <div className="logo">
          <img src="/CareerLink-logos__white.png" alt="logo" />
        </div>
        <ul className={!show ? "menu" : "show-menu menu"}>
          <li>
            <NavLink to={"/"} onClick={() => setShow(false)}>
              HOME
            </NavLink>
          </li>
          <li>
            <NavLink to={"/job/getall"} onClick={() => setShow(false)}>
              ALL JOBS
            </NavLink>
          </li>
          <li>
            <NavLink to={"/applications/me"} onClick={() => setShow(false)}>
              {user && user.role === "Employer"
                ? "APPLICANT'S APPLICATIONS"
                : "MY APPLICATIONS"}
            </NavLink>
          </li>
          {user && user.role === "Employer" ? (
            <>
              <li>
                <NavLink to={"/job/post"} onClick={() => setShow(false)}>
                  POST NEW JOB
                </NavLink>
              </li>
              <li>
                <NavLink to={"/job/me"} onClick={() => setShow(false)}>
                  VIEW YOUR JOBS
                </NavLink>
              </li>
            </>
          ) : (
            <></>
          )}

          <button onClick={handleLogout}>LOGOUT</button>
          <li className="user-name"><b>{user.name}</b></li>
        </ul>
        <div className="hamburger">
          <GiHamburgerMenu onClick={() => setShow(!show)} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
