import React from 'react';
import styles from './SideBar.module.css';

export const SideBar: React.FC = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img src="/WorkSenseLogo.svg" alt="WorkSense Logo" />
      </div>

      <nav>
        <ul>
          <li className={styles.active}>
            <span className={styles.icon}><img src="/Book open.svg" alt="Projects" /></span> My Projects
          </li>
          <li>
            <span className={styles.icon}><img src="/Home.svg" alt="Account" /></span> Account
          </li>
        </ul>
      </nav>
    </aside>
  );
}; 