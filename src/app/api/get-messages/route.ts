import dbConnection from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { User } from "next-auth";
import mongoose from "mongoose";
import { messageSchema } from "./../../../schemas/messageSchema";

export async function GET(request: Request) {
    await dbConnection();

    const session = await getServerSession(authOptions);

    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Not authenticated",
            },
            {
                status: 401,
            }
        );
    }

    const userId = new mongoose.Types.ObjectId(user._id);
    try {
        const user = await UserModel.aggregate([
            {
                $match: {
                    id: userId,
                },
            },
            {
                $unwind: "$messages",
            },
            {
                $sort: {
                    "messages.createdAt": -1,
                },
            },

            {
                $group: {
                    _id: "$_id",
                    messages: { $push: "$messages" },
                },
            },
        ]);

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found or the user have no messages",
                },
                {
                    status: 500,
                }
            );
        }
        if (user.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "User have no messages",
                },
                {
                    status: 500,
                }
            );
        }

        return Response.json(
            {
                success: true,
                messages: user[0].messages,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.log("Error while getting the user messages");

        return Response.json(
            {
                success: false,
                message: "Error while getting the user messages",
            },
            {
                status: 500,
            }
        );
    }
}
