import { verifyToken } from "./bundleMiddleware/tokenAuth.js";
import {
  checkProjectMembership,
  checkProjectPermission,
} from "./bundleMiddleware/projectAuth.js";

// Base authentication middleware
export const auth = verifyToken;

// Project member middleware
export const memberAuth = [verifyToken, checkProjectMembership];

// Permission-based middleware factories
export const withPermission = (permission: string) => [
  verifyToken,
  checkProjectMembership,
  checkProjectPermission(permission),
];
