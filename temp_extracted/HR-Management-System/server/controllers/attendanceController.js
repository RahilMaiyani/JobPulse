import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js"; 
import mongoose from "mongoose";

export const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));
    
    const todayString = new Date().toISOString().split("T")[0];

    const activeLeave = await Leave.findOne({
      userId: userId,
      status: "approved",
      fromDate: { $lte: todayEnd }, 
      toDate: { $gte: todayStart }  
    });

    if (activeLeave) {
      return res.status(403).json({ 
        msg: "Check-in blocked. You are on approved leave today." 
      });
    }
    
    const exists = await Attendance.findOne({
      userId: userId,
      date: todayString
    });

    if (exists) {
      return res.status(400).json({ msg: "Already checked in" });
    }

    const record = await Attendance.create({
      userId: userId,
      date: todayString,
      checkIn: new Date()
    });

    res.json(record);
  } catch (err) {
    res.status(500).json({ msg: "Check-in failed" });
  }
};

export const checkOut = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const record = await Attendance.findOne({
      userId: req.user.id,
      date: today
    });

    if (!record) {
      return res.status(400).json({ msg: "Check-in first" });
    }

    record.checkout = new Date(); 
    await record.save();

    res.json(record);
  } catch (err) {
    res.status(500).json({ msg: "Check-out failed" });
  }
};

export const todayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({
      userId: req.user.id,
      date: today
    });

    if (!attendance) {
      return res.json({
        checkIn: null,
        checkOut: null
      });
    }

    res.json({
      checkIn: attendance.checkIn,
      checkOut: attendance.checkout
    });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching attendance" });
  }
};


export const getAllAttendance = async (req, res) => {
  try {
    const data = await Attendance.find();

    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching attendance" });
  }
};

export const getUserAttendance = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }

    const record = await Attendance.findOne({
      userId: new mongoose.Types.ObjectId(userId)
    }).sort({ checkIn: -1 });

    res.json(record || null);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error fetching attendance" });
  }
};

export const getAttendanceFilters = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ msg: "Unauthorized" });

    const filters = await Attendance.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(req.user.id),
          date: { $ne: null, $ne: "" } 
        } 
      },
      {
        $addFields: {
          validDate: { $toDate: "$date" }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$validDate" },
            month: { $month: "$validDate" }
          }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);

    res.json(filters);
  } catch (err) {
    console.error("Filter Fetch Error:", err);
    res.status(500).json({ msg: "Server error fetching filters" });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const { month, year, page = 1 } = req.query;
    const limit = 31; 
    const skip = (page - 1) * limit;

    let query = { userId: req.user.id };

    if (month && year) {
      
      const formattedMonth = month.toString().padStart(2, '0');
      const startStr = `${year}-${formattedMonth}-01`;
      const endStr = `${year}-${formattedMonth}-31T23:59:59`;

      query.date = { $gte: startStr, $lte: endStr };
    }

    const logs = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    // console.log(logs)

    const total = await Attendance.countDocuments(query);

    res.json({
      logs,
      pagination: { 
        total, 
        page: parseInt(page), 
        pages: Math.ceil(total / limit) 
      }
    });
  } catch (err) {
    console.error("Attendance Fetch Error:", err);
    res.status(500).json({ msg: "Server error fetching attendance" });
  }
};

export const bulkFixAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const fixTime = process.env.DEFAULT_CHECKOUT_TIME || "18:00"; 

    const ghosts = await Attendance.find({ 
      date: { $lt: today }, 
      checkout: null 
    });

    if (ghosts.length === 0) {
      return res.json({ msg: "No records to fix." });
    }

    const updatePromises = ghosts.map((doc) => {
      const autoDate = new Date(`${doc.date}T${fixTime}:00+05:30`);
      
      return Attendance.updateOne(
        { _id: doc._id },
        { $set: { checkout: autoDate } }
      );
    });

    await Promise.all(updatePromises);

    res.json({ msg: `Successfully closed ${ghosts.length} sessions at ${fixTime}.` });
  } catch (err) {
    console.error("Bulk Fix Error:", err);
    res.status(500).json({ msg: "Bulk fix failed" });
  }
};


export const fixSingleAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { customTime } = req.body;

    const defaultTime = process.env.DEFAULT_CHECKOUT_TIME || "18:00";
    const fixTime = customTime || defaultTime;

    const record = await Attendance.findById(id);
    if (!record) return res.status(404).json({ msg: "Record not found" });

    const autoDate = new Date(`${record.date}T${fixTime}:00+05:30`);
    record.checkout = autoDate;
    
    await record.save();

    res.json({ msg: "Session fixed." });
  } catch (err) {
    console.error("Single Fix Error:", err);
    res.status(500).json({ msg: "Failed to fix record" });
  }
};