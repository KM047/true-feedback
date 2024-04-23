import dbConnection from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";

const UsernameQuerySchema = z.object({
    username: usernameValidation,
});

/**
 *  TODO:
 * @assignments for making the zod object like above for the other routes also
 */

export async function GET(request: Request) {
    // In this if the user send the data in other methods instead of get method then following check is for that

    /**
     * But this error also solve by the next js
     * so we don't have to check this error
     */

    // if (request.method !== "GET") {
    //     return Response.json(
    //         {
    //             success: false,
    //             message: "Method is not supported",
    //         },
    //         {
    //             status: 405,
    //         }
    //     );
    // }

    await dbConnection();

    try {
        const { searchParams } = new URL(request.url); // extract the url from the request

        const queryParams = {
            username: searchParams.get("username"),
        }; // extract the query params from the url

        // validate with zod

        const result = UsernameQuerySchema.safeParse(queryParams);

        // console.log(result);

        if (!result.success) {
            const usernameError = result.error.format().username?._errors || [];

            return Response.json(
                {
                    success: false,
                    message:
                        usernameError?.length > 0
                            ? usernameError.join(", ")
                            : "Invalid query parameters",
                },
                {
                    status: 400,
                }
            );
        }

        const { username } = result.data;

        const existingVerifiedUser = await UserModel.findOne({
            username,
            isVerified: true,
        });

        if (existingVerifiedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Username is already taken",
                },
                {
                    status: 400,
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Username is available",
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error("Error checking username");

        return Response.json(
            {
                success: false,
                message: "Error checking username",
            },
            {
                status: 500,
            }
        );
    }
}
