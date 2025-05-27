import { Story } from "@/types/StoryType";
import LoadingSpinner from "../Loading/LoadingSpinner";
import styles from "./ProjectView.module.css";

const RecentBacklogItems: React.FC<{ isloading: boolean; stories: Story[] }> = ({
  isloading,
  stories,
}) => {
  return (
    <section className={styles.backlogPreview}>
      <h2>Recent Backlog Items</h2>

      {isloading ? (
        <LoadingSpinner text="Loading backlog items..." />
      ) : (
        <div className={styles.backlogItems}>
          {stories.slice(0, 5).map((item) => (
            <div key={item.id} className={styles.backlogItem}>
              <div className={styles.backlogItemHeader}>
                <span className={styles.itemType}>Story</span>
                <span className={`${styles.itemStatus} ${styles[item.status]}`}>
                  {item.status}
                </span>
              </div>
              <h4>{item.name}</h4>
              <p>{item.description}</p>
              <div className={styles.itemMeta}>
                <span>Priority: {item.priority}</span>
                {item.storyPoints !== undefined && item.storyPoints > 0 && (
                  <span>Size: {item.storyPoints}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default RecentBacklogItems;
