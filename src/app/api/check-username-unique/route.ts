import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
    username: usernameValidation
});

export async function GET(req: Request) {

    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const queryParam = {
            username: searchParams.get("username")
        }

        const result = UsernameQuerySchema.safeParse(queryParam);

        if (!result.success) {
            const UsernameErrors = result.error.format().username?._errors || [];
            return Response.json({
                success: false,
                message: UsernameErrors?.length > 0 ?
                    UsernameErrors.join(", ") :
                    "Invalid query parameters."
            }, { status: 400 })
        }

        const { username } = result.data;

        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true });

        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: "Username already exists."
            }, { status: 400 });
        }

        return Response.json({
            success: true,
            message: "Username is unique."
        }, { status: 200 });

    } catch (error) {

        console.log("Error checking username", error);
        return Response.json({
            success: false,
            message: "Error checking username."
        }, { status: 500 })
    }

}