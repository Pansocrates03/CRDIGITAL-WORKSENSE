import { Request, Response } from "express";
import { db } from "../models/firebase.js";
import { LeaderboardEntry } from "../models/forYougamification.js";

// GET /api/v1/projects/:projectId/gamification/leaderboard/:userId
export const getPersonalGamification = async (req: Request, res: Response) => {
  const { projectId, userId } = req.params;
  try {
    const docRef = db
      .collection("projects")
      .doc(projectId)
      .collection("gamification")
      .doc("leaderboard");
    const docSnap = await docRef.get();
    
    // If no leaderboard exists, return default state
    if (!docSnap.exists) {
      return res.json({
        points: 0,
        name: "",
        personalPhrase: null,
        profilePicture: null,
        badges: [],
      });
    }

    const data = docSnap.data();
    // If user not found in leaderboard, return default state
    if (!data || !data[userId]) {
      return res.json({
        points: 0,
        name: "",
        personalPhrase: null,
        profilePicture: null,
        badges: [],
      });
    }

    const entry: LeaderboardEntry = data[userId];
    return res.json({
      points: entry.points,
      name: entry.name,
      personalPhrase: entry.personalPhrase || null,
      profilePicture: entry.profilePicture || null,
      badges: entry.badges || [],
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching leaderboard entry", error });
  }
};

// PUT /api/v1/projects/:projectId/gamification/leaderboard/:userId
export const updatePersonalGamification = async (req: Request, res: Response) => {
  const { projectId, userId } = req.params;
  const { personalPhrase, profilePicture } = req.body;
  if (personalPhrase && personalPhrase.length > 100) {
    return res.status(400).json({ message: "personalPhrase must be 100 characters or less" });
  }
  try {
    const docRef = db
      .collection("projects")
      .doc(projectId)
      .collection("gamification")
      .doc("leaderboard");
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ message: "Leaderboard not found" });
    }
    const data = docSnap.data();
    if (!data || !data[userId]) {
      return res.status(404).json({ message: "User not found in leaderboard" });
    }
    // Update only the allowed fields
    const updates: any = {};
    if (personalPhrase !== undefined) updates[`${userId}.personalPhrase`] = personalPhrase;
    if (profilePicture !== undefined) updates[`${userId}.profilePicture`] = profilePicture;
    await docRef.update(updates);
    return res.json({ message: "Personal gamification info updated" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating leaderboard entry", error });
  }
}; 