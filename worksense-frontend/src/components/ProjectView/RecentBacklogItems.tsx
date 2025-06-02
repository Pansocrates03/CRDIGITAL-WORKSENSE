import LoadingSpinner from "../Loading/LoadingSpinner";
import styles from "./ProjectView.module.css";

interface RecentBacklogItemsProps {
  isloading: boolean;
  items: any[];
  compact?: boolean;
  maxItems?: number;
}

const RecentBacklogItems: React.FC<RecentBacklogItemsProps> = ({
                                                                 isloading,
                                                                 items,
                                                                 compact = false,
                                                                 maxItems = 3
                                                               }) => {
  const displayItems = items.slice(0, maxItems);

  return (
      <section className={`${styles.backlogPreview} ${compact ? styles.compactCard : ''}`}>
        <h2 className={compact ? styles.compactTitle : ''}>Recent Backlog Items</h2>

        {isloading ? (
            <LoadingSpinner text="Loading backlog items..." />
        ) : (
            <div className={styles.backlogItems}>
              {displayItems.map((item) => (
                  <div key={item.id} className={`${styles.backlogItem} ${compact ? styles.compactBacklogItem : ''}`}>
                    <div className={styles.backlogItemHeader}>
                      <span className={styles.itemType}>{item.type}</span>
                      <span className={`${styles.itemStatus} ${styles[item.status]}`}>
                  {item.status}
                </span>
                    </div>

                    <h4 className={compact ? styles.compactItemTitle : ''}>
                      {item.name}
                    </h4>

                    {item.description && (
                        <p className={compact ? styles.compactItemDescription : ''}>
                          {item.description}
                        </p>
                    )}

                    <div className={styles.itemMeta}>
                      <span>Priority: {item.priority}</span>
                      {item.size !== undefined && item.size > 0 && (
                          <span>Size: {item.size}</span>
                      )}
                    </div>
                  </div>
              ))}

              {items.length > maxItems && (
                  <div className={styles.moreItemsIndicator}>
                    <span>+{items.length - maxItems} more items</span>
                  </div>
              )}
            </div>
        )}
      </section>
  );
};

export default RecentBacklogItems;