import React from "react";
import "../styles/global.css";

const UserInfo = ({ username }) => {
  return (
    <div className="header">
      <div className="container">
        <div className="user-info">
          <h2>{username}</h2>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
