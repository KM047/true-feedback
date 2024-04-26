import UserModel from "@/model/User.model";
import dbConnection from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function DELETE(
    request: Request,
    { params }: { params: { messageId: string } }
) {
    const messageId = params.messageId;
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
        const updatedResult = await UserModel.updateOne(
            {
                _id: userId,
            },
            {
                $pull: {
                    messages: { _id: messageId },
                },
            }
        );

        if (updatedResult.modifiedCount == 0) {
            return Response.json(
                {
                    success: false,
                    message: "Message not found or already deleted",
                },
                {
                    status: 401,
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Message deleted successfully",
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.log("Error while deleting the user messages");

        return Response.json(
            {
                success: false,
                message: "Error while deleting the user message",
            },
            {
                status: 500,
            }
        );
    }
}
