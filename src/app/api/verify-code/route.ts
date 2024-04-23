import dbConnection from "@/lib/dbConnect";
import UserModel from "@/model/User.model";

export async function POST(request: Request) {
    await dbConnection();

    try {
        const { username, code } = await request.json();

        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({ username: decodedUsername });

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                {
                    status: 500,
                }
            );
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();

            return Response.json(
                {
                    success: true,
                    message: "Account verified successfully",
                },
                {
                    status: 200,
                }
            );
        } else if (!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message: "Verification code is expired",
                },
                {
                    status: 500,
                }
            );
        } else {
            return Response.json(
                {
                    success: false,
                    message: "Incorrect verification code",
                },
                {
                    status: 400,
                }
            );
        }
    } catch (error) {
        console.error("Error while checking the verification code");

        return Response.json(
            {
                success: false,
                message: "Error checking verification code",
            },
            {
                status: 500,
            }
        );
    }
}
