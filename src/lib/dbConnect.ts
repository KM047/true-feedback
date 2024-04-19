import mongoose from "mongoose";

type ConnectionConfig = {
    isConnected?: number;
};

const connection: ConnectionConfig = {};

async function dbConnection(): Promise<void> {
    if (connection.isConnected) {
        console.log("Already connected to database");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URL! || "");

        console.log("db connected", db);
        console.log("db connection", db.connections);

        connection.isConnected = db.connections[0].readyState;

        console.log("DB connected successfully");
    } catch (error: any) {
        console.log("Database connection failed");

        process.exit(1);
    }
}

export default dbConnection;
