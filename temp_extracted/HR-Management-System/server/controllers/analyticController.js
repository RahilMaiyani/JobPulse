import Attendance from "../models/Attendance.js";

export const getPunctualityAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    
    const shiftStart = process.env.SHIFT_START_TIME || "10:30";
    const graceMins = parseInt(process.env.GRACE_PERIOD_MINUTES || "30", 10);
    
    const [shiftHour, shiftMin] = shiftStart.split(":").map(Number);
    const shiftMins = (shiftHour * 60) + shiftMin;
    const lateThreshold = shiftMins + graceMins;
    const severeThreshold = shiftMins + 60;

    const query = { checkIn: { $ne: null } };
    if (startDate && endDate) query.date = { $gte: startDate, $lte: endDate };

    let records = await Attendance.find(query).populate('userId', 'name department');

    if (department && department !== 'All') {
      records = records.filter(r => r.userId?.department === department);
    }

    let validCheckIns = 0;
    let weekendCheckIns = 0;
    let early = 0, onTime = 0, late = 0, severe = 0;
    let cumulativeLost = 0, cumulativeArrival = 0;
    
    const chartMap = {};
    const offenderMap = {};

    for (const record of records) {
      if (!record.userId) continue;

      const dayOfWeek = new Date(record.date).getDay(); 
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendCheckIns++;
        continue;
      }

      validCheckIns++;

      // --- FIX: Force Asia/Kolkata timezone translation ---
      const istTimeString = new Date(record.checkIn).toLocaleTimeString("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });

      // Parse absolute hours and minutes from the structured "HH:MM" string
      const [istHour, istMin] = istTimeString.split(":").map(Number);
      const userMins = (istHour * 60) + istMin;
      
      cumulativeArrival += userMins;

      let category = "onTime";
      let lostMins = 0;

      // Strict Logic Branching
      if (userMins < shiftMins) {
        category = "early";
        early++;
      } else if (userMins <= lateThreshold) {
        category = "onTime";
        onTime++;
      } else {
        category = "late";
        late++;
        lostMins = userMins - shiftMins;
        cumulativeLost += lostMins;
        
        if (userMins >= severeThreshold) severe++;
      }

      // Group for Time-Series Chart
      const dateKey = record.date;
      if (!chartMap[dateKey]) {
        chartMap[dateKey] = { date: dateKey, early: 0, onTime: 0, late: 0, severe: 0 };
      }
      
      chartMap[dateKey][category]++;
      if (userMins >= severeThreshold) chartMap[dateKey].severe++;

      // Group for Offender List
      if (category === "late") {
        const uid = record.userId._id;
        if (!offenderMap[uid]) {
          offenderMap[uid] = {
            userId: uid,
            name: record.userId.name,
            department: record.userId.department,
            lateCount: 0,
            severeCount: 0,
            totalMinutesLate: 0
          };
        }
        offenderMap[uid].lateCount++;
        offenderMap[uid].totalMinutesLate += lostMins;
        if (userMins >= severeThreshold) offenderMap[uid].severeCount++;
      }
    }

    // Averages and Percentages
    let avgArrival = "--:--";
    if (validCheckIns > 0) {
      const avgMins = Math.round(cumulativeArrival / validCheckIns);
      avgArrival = `${String(Math.floor(avgMins / 60)).padStart(2, '0')}:${String(avgMins % 60).padStart(2, '0')}`;
    }

    const onTimeRate = validCheckIns > 0 ? Math.round(((early + onTime) / validCheckIns) * 100) : 100;

    res.status(200).json({
      summary: {
        totalValidCheckIns: validCheckIns,
        weekendOvertimeCheckIns: weekendCheckIns,
        averageArrivalTime: avgArrival,
        onTimeRate,
        breakdown: { early, onTime, late, severeLate: severe },
        cumulativeMinutesLost: cumulativeLost
      },
      chartData: Object.values(chartMap).sort((a, b) => new Date(a.date) - new Date(b.date)),
      offendersList: Object.values(offenderMap).sort((a, b) => b.lateCount - a.lateCount)
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ msg: "Failed to generate analytics" });
  }
};