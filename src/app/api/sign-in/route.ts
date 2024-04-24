import dbConnection from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {

    await dbConnection()

    try {
        const { email, password } = await request.json();


        console.log("email " + email);
        console.log("password " + password);
        

        

        const userWithVerifiedEmail = await UserModel.findOne({
            email,
            // isVerified: true, //only verified users can login
        });

        if (!userWithVerifiedEmail) {
            return Response.json(
                {
                    success: true,
                    message: "Please verify your email first",
                },
                {
                    status: 400,
                }
            );
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            userWithVerifiedEmail.password
        );

        if (!isPasswordCorrect) {
            return Response.json(
                {
                    success: true,
                    message: "Password is incorrect please try again",
                },
                {
                    status: 400,
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "User logged in successfully",
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.log("Error while sign in user", error);

        return Response.json(
            {
                success: false,
                message: "Error while sign in user",
            },
            {
                status: 500,
            }
        );
    }
}
