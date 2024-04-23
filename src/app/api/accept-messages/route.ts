import dbConnection from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { User } from "next-auth";

export async function POST(request: Request) {
    await dbConnection();

    const session = await getServerSession(authOptions);

    /**
     * In the below code for declaring the types we use the assertion to set the types
     * const dataType : Type = ________ as Type
     */

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

    const userId = user?._id;

    const { acceptMessages } = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                isAcceptingMessages: acceptMessages,
            },
            {
                new: true,
            }
        );

        if (!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Failed to update user status to accept message",
                },
                {
                    status: 401,
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Message acceptance status updated successfully",
                updatedUser,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.log("Failed to update user status to accept message");
        return Response.json(
            {
                success: false,
                message: "Failed to update user status to accept message",
            },
            {
                status: 501,
            }
        );
    }
}

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

    const userId = user?._id;

    try {
        const foundUser = await UserModel.findById(userId);

        if (!foundUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                {
                    status: 404,
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "User found",
                isAcceptingMessages: foundUser.isAcceptingMessages,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.log("Failed to update user status to accept message");
        return Response.json(
            {
                success: false,
                message: "Error in getting user accepting message status", 
            },
            {
                status: 501,
            }
        );
    }
}
