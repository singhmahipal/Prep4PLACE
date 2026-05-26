import { requireAuth, clerkClient } from "@clerk/express";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

export const protectRoute = [
    requireAuth(),
    async (req, res, next) => {
        try {
            const clerkId = req.auth.userId;

            if (!clerkId) {
                return res.status(401).json({message: "Unauthorized - invalid token"})
            };

            // find user in db using clerkId
            let user = await User.findOne({clerkId});

            if (!user) {
                // Auto-create user from Clerk info if they don't exist in local database
                try {
                    const clerkUser = await clerkClient.users.getUser(clerkId);
                    const email = clerkUser.emailAddresses[0]?.emailAddress;
                    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User";
                    const profileImage = clerkUser.imageUrl;

                    user = await User.create({
                        clerkId,
                        email,
                        name,
                        profileImage
                    });

                    // Sync to Stream
                    await upsertStreamUser({
                        id: clerkId,
                        name,
                        image: profileImage
                    });
                    
                    console.log("Auto-created user on the fly in protectRoute:", user);
                } catch (clerkError) {
                    console.error("Failed to auto-create user from Clerk in protectRoute:", clerkError);
                    return res.status(404).json({message: "User not found in database and failed to fetch from Clerk"});
                }
            }

            // attach user to req
            req.user = user;

            return next();
        } catch (error) {
            console.log("Error in protectRoute middleware", error);
            return res.status(500).json({message: "Internal Server Error"});
        }
    }
]