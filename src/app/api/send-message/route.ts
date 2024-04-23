import dbConnection from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { Message } from "@/model/User.model";

export async function POST(request: Request) {
    await dbConnection();

    const { username, content } = await request.json();

    try {
        const user = await UserModel.findOne({ username });

        if (!user) {
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

        if (!user.isAcceptingMessages) {
            return Response.json(
                {
                    success: false,
                    message: "User not accepting messages",
                },
                {
                    status: 403,
                }
            );
        }

        const newMessage = { content, createdAt: new Date() };

        user.messages.push(newMessage as Message);

        await user.save();

        return Response.json(
            {
                success: true,
                message: "Message sent successfully",
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.log("Failed to add message");

        return Response.json(
            {
                success: false,
                message: "Failed to add message",
            },
            {
                status: 500,
            }
        );
    }
}
