import React, { useState } from "react";
import styles from "./auth.module.scss";
import { BiLogIn } from "react-icons/bi";
import Card from "../../components/card/Card";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { loginUser, validateEmail } from "../../services/authService";
import { SET_LOGIN, SET_NAME } from "../../redux/features/auth/authSlice";
import Loader from "../../components/loader/Loader";

const initialState = {
  email: "",
  password: "",
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setformData] = useState(initialState);
  const { email, password } = formData;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setformData({ ...formData, [name]: value });
  };

  const login = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("All fields are required");
    }

    if (!validateEmail(email)) {
      return toast.error("Please enter a valid email");
    }

    const userData = {
      email,
      password,
    };
    setIsLoading(true);
    try {
      const data = await loginUser(userData);
      await dispatch(SET_LOGIN(true));
      await dispatch(SET_NAME(data.name));
      navigate("/dashboard");
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <div className={`container ${styles.auth}`}>
      {isLoading && <Loader />}
      <Card>
        <div className={styles.form}>
          <div className="--flex-center">
            <BiLogIn
              size={40}
              color="#1e2749"
            />
          </div>
          <h2>Welcome Back</h2>

          <form onSubmit={login}>
            <div className="--form-control">
              <input
                type="email"
                placeholder="Enter your email"
                required
                name="email"
                value={email}
                onChange={handleInputChange}
              />
            </div>
            <div className="--form-control">
              <input
                type="password"
                placeholder="Enter your password"
                required
                name="password"
                value={password}
                onChange={handleInputChange}
              />
            </div>
            <button
              type="submit"
              className="--btn --btn-primary --btn-block"
            >
              Sign In
            </button>
          </form>

          <div className="--flex-center">
            <Link to="/forgot">Forgot Password?</Link>
          </div>

          <div className={styles.register}>
            <Link to="/">Back to Home</Link>
            <p>&nbsp;•&nbsp;</p>
            <Link to="/register">Create Account</Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
