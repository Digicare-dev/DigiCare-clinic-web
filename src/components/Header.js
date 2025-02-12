import "./Header.css";
import logo from "../assets/DigiCare__logo.png";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Header() {
  // const { logout } = useContext(AuthContext);
  return (
    <header>
      <img
        src={logo}
        alt="DigiCare"
        style={{ width: "150px", height: "40px" }}
      />
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          paddingRight: "40px",
        }}
      >
        <button style={{ width: "fit-content" }}>Logout</button>
      </div>
    </header>
  );
}

export default Header;
