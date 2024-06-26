import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { verifySchema } from "@/schemas/verifySchema";

const CodeVerifyQuerySchema = z.object({

})


export async function POST(req: Request) {
    await dbConnect();

    try {

        const { username, code } = await req.json();
        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({
            username: decodedUsername
        })

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 500 })
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();

            return Response.json({
                success: true,
                message: "Account verified successfully"
            }, { status: 200 })
        }
        else if (!isCodeNotExpired) {
            return Response.json({
                success: false,
                message: "Verification code is expired. Please signup again to get new code"
            }, { status: 400 })
        }
        else {
            return Response.json({
                success: false,
                message: "Incorrect verification code"
            }, { status: 400 })
        }
    } catch (error) {
        console.log("Error verifying user", error);
        return Response.json({
            success: false,
            message: "Error while verifying user."
        }, { status: 500 })
    }
}