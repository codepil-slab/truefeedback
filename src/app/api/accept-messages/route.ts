import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth"

export async function POST(req: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);


    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not authenticated"
        }, { status: 401 });
    }

    const userId = user._id;
    const { acceptMessages } = await req.json();


    try {

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessage: acceptMessages },
            { new: true }
        );

        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "Failed to update user accept message status"
            }, { status: 500 });
        }

        return Response.json({
            success: true,
            message: "Message acceptance status updated successfully"
        }, { status: 200 });

    } catch (error) {
        console.log("Failed to update user accept message status", error);
        return Response.json({
            success: false,
            message: "Failed to update user accept message status"
        }, { status: 500 });
    }
}

export async function GET(req: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);

    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not authenticated"
        }, { status: 401 });
    }

    const userId = user?._id || "667abd4ad713b6eae90fd4a8";


    try {
        const foundUser = await UserModel.findById(userId);
        if (!foundUser) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            isAcceptingMessage: foundUser.isAcceptingMessage,
            message: "Users message acceptance status"
        }, { status: 200 });
    } catch (error) {
        console.log("Failed to get user message acceptance status", error);
        return Response.json({
            success: false,
            message: "Failed to get user message acceptance status"
        }, { status: 500 });
    }
}