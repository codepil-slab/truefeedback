import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

export default async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("Already connected to database")
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "");
        connection.isConnected = db.connections[0].readyState;

        // console.log(db);
        // console.log(db.connections);

        console.log("DB Connected successfully");
    } catch (error) {
        console.log("Error connecting to database", error);
        process.exit(1);
    }
}