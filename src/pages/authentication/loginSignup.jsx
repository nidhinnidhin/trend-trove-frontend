import React, { useState, useEffect } from "react";
import styles from "@/styles/LoginSignup.module.css";
import Drawer from "@mui/material/Drawer";
import SignupDrawer from "@/components/drawers/signupDrawer";
import LoginDrawer from "@/components/drawers/loginDrawer"; 
import logo from '../../media/logo.png'
import Image from "next/image";

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
    setState({ ...state, login: false }); 
  };

  const onCloseSignupDrawer = () => {
    setState({ ...state, right: false });
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
              <Image
                src={logo}
                height={75}
                width={180}
                alt="Company Logo"
                priority
                className={styles.logoImage}
              />
            </div>
            <div className={styles.buttons}>
              <button
                className={styles.loginbutton}
                onClick={toggleDrawer("login", true)}
              >
                Sign In
              </button>
              <button
                className={styles.signupbutton}
                onClick={toggleDrawer("right", true)}
              >
                Get Started
              </button>
            </div>
          </div>
          
          <div className={styles.heroSection}>
            <h1 className={styles.mainHeading}>
              Your Fashion Journey Starts Here
            </h1>
            <p
              className={`${styles.changableTextDescription} ${
                fade ? styles.fadeIn : styles.fadeOut
              }`}
            >
              Discover local fashion in {items[currentIndex]}
            </p>
          </div>

          <div className={styles.searchWrapper}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Enter your delivery location"
                className={styles.input}
              />
              <button className={styles.findButton}>
                Explore Stores
              </button>
            </div>
            <p className={styles.searchHint}>
              Popular cities: Kochi, Thiruvananthapuram, Kozhikode
            </p>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.imageWrapper}>
            <img
              className={styles.banner}
              src="https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Fashion Banner"
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
