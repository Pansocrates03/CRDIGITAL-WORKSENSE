// helpers/firestoreHelpers.ts (or similar utility file)
import { db } from "../../models/firebase.js"; // Adjust path
import { CollectionReference, DocumentData } from "firebase-admin/firestore";
import { BacklogItemType } from "../../../types/backlog.js"; // Adjust path

const ALLOWED_ITEM_TYPES: ReadonlySet<BacklogItemType> = new Set([
  "epic",
  "story",
  "bug",
  "techTask",
  "knowledge",
]);

// Map singular type names to plural collection names
const TYPE_TO_COLLECTION: Record<BacklogItemType, string> = {
  epic: "epics",
  story: "stories",
  bug: "bugs",
  techTask: "techTasks",
  knowledge: "knowledge",
};

/**
 * Gets a Firestore CollectionReference for a specific backlog item type within a project.
 * Uses plural collection names (e.g., "story" type uses "stories" collection)
 * Assumes structure: /projectss/{projectId}/backlog/items/{pluralItemType}
 * @param projectId The project ID.
 * @param itemType The type of the backlog item.
 * @returns Firestore CollectionReference.
 * @throws Error if itemType is invalid.
 */
export const getItemCollection = (
  projectId: string,
  itemType: string
): CollectionReference<DocumentData> => {
  if (!ALLOWED_ITEM_TYPES.has(itemType as BacklogItemType)) {
    throw new Error(`Invalid backlog item type specified: ${itemType}`);
  }
  // Ensure itemType is treated as the specific literal type for safety if needed elsewhere
  const validItemType = itemType as BacklogItemType;

  // Get the plural collection name
  const collectionName = TYPE_TO_COLLECTION[validItemType];

  // Using the path structure with plural collection names
  return db
    .collection("projectss")
    .doc(projectId)
    .collection("backlog")
    .doc("items") // Static "items" ID
    .collection(collectionName);
};

/**
 * Gets a Firestore DocumentReference for a specific backlog item.
 * Requires the item type hint.
 * @param projectId The project ID.
 * @param itemType The type of the backlog item.
 * @param itemId The ID of the item.
 * @returns Firestore DocumentReference.
 * @throws Error if itemType is invalid.
 */
export const getItemRef = (
  projectId: string,
  itemType: string,
  itemId: string
): FirebaseFirestore.DocumentReference<DocumentData> => {
  const collectionRef = getItemCollection(projectId, itemType);
  return collectionRef.doc(itemId);
};
