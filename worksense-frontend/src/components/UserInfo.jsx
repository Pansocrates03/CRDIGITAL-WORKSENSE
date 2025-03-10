import React from "react";
import "../styles/global.css";

const UserInfo = ({ firstName, lastName, email }) => {
  return (
    <div className="header">
      <div className="container">
        <div className="user-info">
          <div className="user-details">
            <h2>
              {firstName} {lastName}
            </h2>
            <p className="email">{email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
