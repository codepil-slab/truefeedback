import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth"
import mongoose from "mongoose";

export async function DELETE(req: Request, { params }: { params: { messageid: string } }) {

    const messageId = params.messageid;
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not authenticated"
        }, { status: 401 });
    }

    try {
        const updatedResult = await UserModel.updateOne(
            { _id: user._id },
            { $pull: { messages: { _id: new mongoose.Types.ObjectId(messageId) } } }
        )

        if (updatedResult.modifiedCount === 0) {
            return Response.json({
                success: false,
                message: "Message not found or already deleted"
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: "Message deleted"
        }, { status: 202 });
    } catch (error) {
        console.log("Error deleting message", error);
        return Response.json({
            success: false,
            message: "Error deleting message"
        }, { status: 500 });
    }

}