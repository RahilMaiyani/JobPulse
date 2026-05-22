import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    date : String,
    checkIn : Date,
    checkout : Date
});

export default mongoose.model("Attendance", attendanceSchema)