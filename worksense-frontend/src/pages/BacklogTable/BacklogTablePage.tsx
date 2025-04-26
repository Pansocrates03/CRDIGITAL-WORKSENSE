import { FC } from "react";
import { useParams } from "react-router-dom";
import styles from "./BacklogTablePage.module.css"; // Nuevo CSS

const backlogItems = [
  {
    id: "1",
    title: "Login Feature",
    description: "Allow users to log into the platform.",
    priority: "High",
    status: "In Progress",
  },
  {
    id: "2",
    title: "Signup Feature",
    description: "Enable new user registration.",
    priority: "Medium",
    status: "To Do",
  },
  {
    id: "3",
    title: "Forgot Password",
    description: "Password recovery via email link.",
    priority: "Low",
    status: "Done",
  },
];

const BacklogTablePage: FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className={styles.backlogTablePageContainer}>
      <div className={styles.backlogTableContent}>
        <h1>Product Backlog - Project {projectId}</h1>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {backlogItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.title}</td>
                  <td>{item.description}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        item.priority === "High"
                          ? styles.highPriority
                          : item.priority === "Medium"
                          ? styles.mediumPriority
                          : styles.lowPriority
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        item.status === "In Progress"
                          ? styles.statusInProgress
                          : item.status === "To Do"
                          ? styles.statusTodo
                          : styles.statusDone
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BacklogTablePage;



