import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : { type : String, required : true},
    email : { type: String, required : true, unique : true},
    password : { type : String, required : true},
    role : {
        type : String,
        enum : ["admin","employee"],
        default  :"employee"
    },
    profilePic : String,
    department : String,

    leaveBalance: {
      sick: { type: Number, default: 12 },    
      casual: { type: Number, default: 12 },  
      earned: { type: Number, default: 0 },
      unpaid: { type: Number, default: 0 }     
    },

    salaryDetails: {
      basicPay: { type: Number, default: 0 },
      specialAllowance: { type: Number, default: 0 }
    },

    bankDetails: {
      accountNumber: { type: String, select: false }, 
      ifscCode: { type: String },
      bankName: { type: String }
    },

    tokenVersion: {
      type: Number,
      default: 0
    }

  },
  { timestamps : true}
);

export default mongoose.model("User", userSchema);