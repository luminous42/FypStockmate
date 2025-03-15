import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectName,
  SET_LOGIN,
  selectIsLoggedIn,
} from "../../redux/features/auth/authSlice";
import { logoutUser } from "../../services/authService";
import Notification from "../notification/Notification";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const name = useSelector(selectName);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const logout = async () => {
    await logoutUser();
    await dispatch(SET_LOGIN(false));
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="--pad header">
        <div className="--flex-between">
          <h3>
            <span className="--fw-thin">Welcome, </span>
            <span className="--color-danger">{name}</span>
          </h3>
          <div className="header-actions">
            {isLoggedIn && <Notification />}
            <button
              onClick={logout}
              className="--btn --btn-danger"
            >
              Logout
            </button>
          </div>
        </div>
        <hr />
      </div>
    </header>
  );
};

export default Header;
