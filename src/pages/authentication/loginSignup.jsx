import React, { useState, useEffect } from "react";
import styles from "@/styles/LoginSignup.module.css";
import Drawer from "@mui/material/Drawer";
import SignupDrawer from "@/components/drawers/signupDrawer";
import LoginDrawer from "@/components/drawers/loginDrawer"; // Import LoginDrawer

const LoginSignup = () => {
  const [state, setState] = useState({
    right: false,
    login: false, // Add a state for login drawer
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };

  const onCloseLoginDrawer = () => {
    setState({ ...state, login: false }); // Close the login drawer
  };

  const onCloseSignupDrawer = () => {
    setState({ ...state, right: false }); // Close the signup drawer
  };

  const items = [
    "Thiruvananthapuram",
    "Kochi",
    "Kozhikode",
    "Thrissur",
    "Kollam",
    "Kannur",
    "Alappuzha",
    "Palakkad",
    "Malappuram",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFade(false); 
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
        setFade(true); 
      }, 500);
    }, 3000); 

    return () => clearInterval(intervalId); 
  }, [currentIndex]);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <div className={styles.header}>
            <div className={styles.logo}>
              <img
                src="https://cdn.4imprint.com/qtz/logos/svg/brands/nobkgd/ogio.svg"
                height={100}
                width={100}
                alt=""
              />
            </div>
            <div className={styles.buttons}>
              <button
                className={styles.loginbutton}
                onClick={toggleDrawer("login", true)} // Open login drawer
              >
                Login
              </button>
              <button
                className={styles.signupbutton}
                onClick={toggleDrawer("right", true)} // Open signup drawer
              >
                Signup
              </button>
            </div>
          </div>
          <div className={styles.text}>
            <p
              className={`${styles.changableTextDescription} ${
                fade ? styles.fadeIn : styles.fadeOut
              }`}
            >
              Order clothes from the nearest shop in {items[currentIndex]}
            </p>
          </div>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Enter your delivery location"
              className={styles.input}
            />
            <button className={styles.findButton}>Find cloth</button>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.img}>
            <img
              className={styles.banner}
              src="https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt=""
            />
          </div>
        </div>
      </div>

      <Drawer
        anchor="right"
        open={state["right"]}
        onClose={onCloseSignupDrawer} // Pass onCloseSignupDrawer function
      >
        <SignupDrawer open={state["right"]} onClose={onCloseSignupDrawer} />
      </Drawer>

      <Drawer
        anchor="right"
        open={state["login"]}
        onClose={onCloseLoginDrawer} // Pass onCloseLoginDrawer function
      >
        <LoginDrawer onClose={onCloseLoginDrawer} /> {/* Pass the onClose prop */}
      </Drawer>
    </div>
  );
};

export default LoginSignup;
