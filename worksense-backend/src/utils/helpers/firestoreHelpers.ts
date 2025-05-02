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
