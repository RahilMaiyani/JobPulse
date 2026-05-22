import User from "../models/User.js";
import Payslip from "../models/Payslip.js";
import Leave from "../models/Leave.js";
import Attendance from "../models/Attendance.js"; 
import { encryptData, decryptData } from "../utils/crypto.js"; 
import { sendEmail } from "../utils/sendEmail.js";
import { buildEmailTemplate } from "../utils/emailTemplate.js";
import PDFDocument from "pdfkit";

const generatePDFBuffer = (user, payslip, rawAccount, daysData) => {
  return new Promise((resolve) => {
    const cleanName = user.name.replace(/\s+/g, '').toLowerCase().padEnd(4, 'x');
    const namePart = cleanName.substring(0, 4);
    const accPart = rawAccount.slice(-4);
    const userPassword = `${namePart}${accPart}`;

    const doc = new PDFDocument({
      userPassword,
      ownerPassword: process.env.ADMIN_PDF_PASSWORD || "admin-master-key",
      permissions: { printing: 'highres', modifying: false },
      size: 'A4',
      margin: 50
    });

    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    doc.rect(0, 0, 600, 110).fill('#1e293b');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(28).text('OfficeLink', 50, 35);
    doc.fillColor('#94a3b8').font('Helvetica').fontSize(10).text('CONFIDENTIAL SALARY STATEMENT', 50, 68);
    
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(16).text(`${payslip.month} ${payslip.year}`, 350, 45, { align: 'right', width: 200 });

    doc.moveDown(5);

    // --- 2. EMPLOYEE DETAILS GRID ---
    let startY = 140;
    doc.rect(50, startY, 495, 90).fill('#f8fafc').stroke('#e2e8f0');
    
    doc.fillColor('#475569').font('Helvetica-Bold').fontSize(9);
    // Col 1
    doc.text('EMPLOYEE NAME', 70, startY + 15);
    doc.text('DEPARTMENT', 70, startY + 45);
    // Col 2
    doc.text('ACCOUNT NUMBER', 250, startY + 15);
    doc.text('DESIGNATION', 250, startY + 45);
    // Col 3 (Attendance Metrics)
    doc.text('PAYABLE DAYS', 430, startY + 15);
    doc.text('UNPAID LEAVES (LWP)', 430, startY + 45);

    doc.fillColor('#0f172a').font('Helvetica').fontSize(11);
    // Col 1 Vals
    doc.text(user.name, 70, startY + 28);
    doc.text(user.department || 'Corporate', 70, startY + 58);
    // Col 2 Vals
    doc.text(`•••• •••• ${accPart}`, 250, startY + 28);
    doc.text(user.role.toUpperCase(), 250, startY + 58);
    // Col 3 Vals
    doc.font('Helvetica-Bold').fillColor('#166534').text(`${daysData.payableDays} Days`, 430, startY + 28);
    doc.fillColor('#e11d48').text(`${daysData.lwpDays} Days`, 430, startY + 58);

    // --- 3. TABLE HEADERS ---
    let tableY = 260;
    doc.rect(50, tableY, 495, 30).fill('#f1f5f9').stroke('#cbd5e1');
    doc.fillColor('#334155').font('Helvetica-Bold').fontSize(10);
    doc.text('EARNINGS', 70, tableY + 10);
    doc.text('AMOUNT (INR)', 220, tableY + 10, { width: 100, align: 'right' });
    doc.text('DEDUCTIONS', 350, tableY + 10);
    doc.text('AMOUNT (INR)', 430, tableY + 10, { width: 100, align: 'right' });

    // --- 4. TABLE ROWS ---
    tableY += 45;
    doc.fillColor('#0f172a').font('Helvetica').fontSize(11);
    
    // Row 1
    doc.text('Basic Pay', 70, tableY);
    doc.text(payslip.earnings.basicPay.toLocaleString('en-IN'), 220, tableY, { width: 100, align: 'right' });
    if (payslip.deductions.lossOfPay > 0) {
      doc.text('Loss of Pay (LWP)', 350, tableY);
      doc.text(payslip.deductions.lossOfPay.toLocaleString('en-IN'), 430, tableY, { width: 100, align: 'right' });
    } else {
      doc.text('-', 430, tableY, { width: 100, align: 'right' });
    }

    // Row 2
    tableY += 30;
    doc.text('Special Allowance', 70, tableY);
    doc.text(payslip.earnings.specialAllowance.toLocaleString('en-IN'), 220, tableY, { width: 100, align: 'right' });
    if (payslip.deductions.professionalTax > 0) {
      doc.text('Professional Tax', 350, tableY);
      doc.text(payslip.deductions.professionalTax.toLocaleString('en-IN'), 430, tableY, { width: 100, align: 'right' });
    } else {
      doc.text('-', 430, tableY, { width: 100, align: 'right' });
    }

    // Table divider
    tableY += 30;
    doc.moveTo(50, tableY).lineTo(545, tableY).lineWidth(1).stroke('#e2e8f0');

    // --- 5. TOTALS BLOCK ---
    tableY += 15;
    const totalEarnings = payslip.earnings.basicPay + payslip.earnings.specialAllowance;
    const totalDeductions = payslip.deductions.lossOfPay + payslip.deductions.professionalTax;

    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('Gross Earnings:', 70, tableY);
    doc.text(totalEarnings.toLocaleString('en-IN'), 220, tableY, { width: 100, align: 'right' });
    
    doc.text('Total Deductions:', 350, tableY);
    doc.text(totalDeductions.toLocaleString('en-IN'), 430, tableY, { width: 100, align: 'right' });

    tableY += 40;
    doc.rect(320, tableY, 225, 50).fill('#4f46e5'); // Indigo Accent Block
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(12);
    doc.text('NET PAY', 340, tableY + 18);
    doc.fontSize(16).text(`Rs. ${payslip.netPay.toLocaleString('en-IN')}`, 400, tableY + 16, { width: 125, align: 'right' });

    // --- 7. FOOTER ---
    doc.fillColor('#94a3b8').font('Helvetica').fontSize(9);
    doc.text('This is a system-generated document. No signature is required.', 50, 750, { align: 'center', width: 495 });

    doc.end();
  });
};


export const getPayrollStatus = async (req, res) => {
  try {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const targetMonthName = lastMonth.toLocaleString('default', { month: 'long' });
    
    const existingRun = await Payslip.findOne({ month: targetMonthName, year: lastMonth.getFullYear() });

    res.status(200).json({
      targetMonth: targetMonthName,
      targetYear: lastMonth.getFullYear(),
      status: existingRun ? "COMPLETED" : "PENDING",
      actionRequired: !existingRun && today.getDate() >= 1 
    });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching payroll status" });
  }
};

export const setupEmployeePayroll = async (req, res) => {
  try {
    const { basicPay, specialAllowance, accountNumber, ifscCode, bankName } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.salaryDetails = { basicPay, specialAllowance };
    
    if (accountNumber) {
      user.bankDetails = {
        accountNumber: encryptData(accountNumber),
        ifscCode,
        bankName
      };
    }

    await user.save();
    res.status(200).json({ msg: "Payroll setup successful" });
  } catch (error) {
    res.status(500).json({ msg: "Error setting up payroll" });
  }
};

export const getMyPayslips = async (req, res) => {
  try {
    const payslips = await Payslip.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(payslips);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching payslips" });
  }
};


export const generateMonthlyPayroll = async (req, res) => {
  try {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const targetMonth = lastMonth.toLocaleString('default', { month: 'long' });
    const targetYear = lastMonth.getFullYear();

    const targetMonthStart = new Date(targetYear, lastMonth.getMonth(), 1);
    const targetMonthEnd = new Date(targetYear, lastMonth.getMonth() + 1, 0, 23, 59, 59);
    const totalDaysInMonth = targetMonthEnd.getDate();

    const alreadyRun = await Payslip.findOne({ month: targetMonth, year: targetYear });
    if (alreadyRun) {
      return res.status(400).json({ msg: "Payroll already generated for this month", month: targetMonth, year: targetYear });
    }

    const employees = await User.find({ "salaryDetails.basicPay": { $gt: 0 } }).select('+bankDetails.accountNumber');
    
    let processedCount = 0;
    let failedEmails = 0;

    for (const emp of employees) {
      const joinDate = new Date(emp.createdAt);
      if (joinDate > targetMonthEnd) continue;

      let activeDaysThisMonth = totalDaysInMonth;
      if (joinDate > targetMonthStart) {
        const diffTime = Math.abs(targetMonthEnd - joinDate);
        activeDaysThisMonth = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      const attendanceCount = await Attendance.countDocuments({
        userId: emp._id,
        date: {
          $gte: targetMonthStart.toISOString().split('T')[0],
          $lte: targetMonthEnd.toISOString().split('T')[0]
        }
      });

      if (attendanceCount === 0 && activeDaysThisMonth > 0) {
        activeDaysThisMonth = 0;
      }

      const unpaidLeaves = await Leave.find({
        userId: emp._id, 
        status: "approved",
        type: "unpaid", 
        fromDate: { $lte: targetMonthEnd },
        toDate: { $gte: targetMonthStart }
      });

      let lwpDays = 0;
      unpaidLeaves.forEach(leave => {
        const start = leave.fromDate < targetMonthStart ? targetMonthStart : leave.fromDate;
        const end = leave.toDate > targetMonthEnd ? targetMonthEnd : leave.toDate;
        const diffTime = Math.abs(end - start);
        lwpDays += Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
      });

      let payableDays = activeDaysThisMonth - lwpDays;
      if (payableDays < 0) payableDays = 0;
      // console.log(`Processing ${emp.name}: Active Days=${activeDaysThisMonth}, LWP Days=${lwpDays}, Payable Days=${payableDays}`);
      const basic = emp.salaryDetails.basicPay;
      const special = emp.salaryDetails.specialAllowance;
      const totalGross = basic + special;

      // Prorate earnings based on payable days
      const proratedBasic = Math.round(basic * (payableDays / totalDaysInMonth));
      const proratedSpecial = Math.round(special * (payableDays / totalDaysInMonth));
      const actualGrossEarned = proratedBasic + proratedSpecial;

      const lopDeduction = totalGross - actualGrossEarned; 
      
      const pTax = actualGrossEarned > 15000 ? 200 : 0; 
      
      let netPay = actualGrossEarned - pTax;
      if (netPay < 0) netPay = 0;

      const newPayslip = await Payslip.create({
        userId: emp._id,
        month: targetMonth,
        year: targetYear,
        earnings: { basicPay: proratedBasic, specialAllowance: proratedSpecial },
        deductions: { lossOfPay: lopDeduction, professionalTax: pTax },
        netPay
      });

      processedCount++;

      if (emp.bankDetails?.accountNumber && emp.email) {
        try {
          const rawAccount = decryptData(emp.bankDetails.accountNumber);
          
          const daysData = { payableDays, lwpDays };
          const pdfBuffer = await generatePDFBuffer(emp, newPayslip, rawAccount, daysData);

          const namePart = emp.name.replace(/\s+/g, '').toLowerCase().padEnd(4, 'x').substring(0, 4);
          const accPart = rawAccount.slice(-4);
          
          const emailHtml = buildEmailTemplate({
            title: "Salary Statement Generated",
            color: "#4f46e5",
            message: `
              <p style="margin-bottom:24px;">Hello <b>${emp.name}</b>,</p>
              <p style="margin-bottom:24px;">Your corporate salary statement for <b>${targetMonth} ${targetYear}</b> has been generated.</p>
              
              <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:24px; margin-bottom:24px;">
                <h3 style="margin-top:0; color:#1e293b; font-size:14px; text-transform:uppercase; letter-spacing:0.05em;">Security Notice</h3>
                <p style="margin-bottom:12px; color:#475569; font-size:14px;">This document is password protected.</p>
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
                  <tr>
                    <td style="font-size:12px; color:#64748b; font-weight:700;">YOUR PASSWORD</td>
                    <td style="font-size:14px; color:#4f46e5; font-weight:800; text-align:right; font-family:monospace;">${namePart}${accPart}</td>
                  </tr>
                </table>
              </div>
            `
          });

          await sendEmail({
            to: emp.email,
            subject: `OfficeLink Payslip - ${targetMonth} ${targetYear}`,
            html: emailHtml,
            attachments: [{
              filename: `Payslip_${targetMonth}_${targetYear}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }]
          });

          newPayslip.isSent = true;
          await newPayslip.save();
        } catch (innerError) {
          console.error(`Failed to generate PDF/Email for ${emp.name}:`, innerError.message);
          failedEmails++;
        }
      }
    }

    const adminEmail = req.user?.email || process.env.EMAIL_USER;
    if (adminEmail) {
      const summaryHtml = buildEmailTemplate({
        title: "Payroll Execution Summary",
        color: "#166534",
        message: `
          <p>The automated payroll engine has completed its cycle.</p>
          <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:24px; margin-bottom:24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:12px; font-size:12px; font-weight:700;">Pay Period</td>
                <td style="padding-bottom:12px; font-size:14px; font-weight:600; text-align:right;">${targetMonth} ${targetYear}</td>
              </tr>
              <tr>
                <td style="padding-bottom:12px; font-size:12px; font-weight:700;">Processed Securely</td>
                <td style="padding-bottom:12px; font-size:14px; font-weight:600; text-align:right;">${processedCount} Employees</td>
              </tr>
            </table>
          </div>
        `
      });

      await sendEmail({
        to: adminEmail,
        subject: `Payroll Summary - ${targetMonth} ${targetYear}`,
        html: summaryHtml
      });
    }

    res.status(200).json({ 
      msg: "Payroll generated successfully", 
      processed: processedCount,
      emailFailures: failedEmails
    });

  } catch (error) {
    console.error("CRITICAL PAYROLL ERROR:", error);
    res.status(500).json({ msg: "Critical error during payroll generation" });
  }
};

export const downloadPayslipPDF = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id);
    if (!payslip) return res.status(404).json({ msg: "Payslip not found" });

    if (payslip.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: "Not authorized to download this document" });
    }

    const emp = await User.findById(payslip.userId).select('+bankDetails.accountNumber');
    if (!emp || !emp.bankDetails?.accountNumber) {
       return res.status(400).json({ msg: "Incomplete bank details. Cannot generate secure PDF." });
    }

    const rawAccount = decryptData(emp.bankDetails.accountNumber);
    const daysData = { payableDays: "Processed", lwpDays: "Processed" }; 
    const pdfBuffer = await generatePDFBuffer(emp, payslip, rawAccount, daysData);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Payslip_${payslip.month}_${payslip.year}.pdf"`,
      'Content-Length': pdfBuffer.length
    });

    res.end(pdfBuffer);
  } catch (error) {
    console.error("PDF Download Error:", error);
    res.status(500).json({ msg: "Critical error during PDF generation" });
  }
};


export const seedMissingPayrollData = async (req, res) => {
  try {
    const users = await User.find({}).select('+bankDetails.accountNumber');
    let updatedCount = 0;
    const banks = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'];

    for (const user of users) {
      if (!user.salaryDetails?.basicPay || user.salaryDetails.basicPay === 0) {
        const randomBasic = Math.floor(Math.random() * (80000 - 30000 + 1)) + 30000;
        const randomSpecial = Math.floor(Math.random() * (20000 - 5000 + 1)) + 5000;
        const randomBank = banks[Math.floor(Math.random() * banks.length)];
        const rawAccount = Math.floor(1000000000 + Math.random() * 9000000000).toString(); 
        const randomIfsc = `${randomBank.substring(0, 4).toUpperCase()}000${Math.floor(1000 + Math.random() * 9000)}`;

        user.salaryDetails = { basicPay: randomBasic, specialAllowance: randomSpecial };
        user.bankDetails = {
          accountNumber: encryptData(rawAccount),
          ifscCode: randomIfsc,
          bankName: randomBank
        };

        await user.save();
        updatedCount++;
      }
    }

    res.status(200).json({ msg: "Database migration complete.", usersUpdated: updatedCount });
  } catch (error) {
    console.error("Migration Error:", error);
    res.status(500).json({ msg: "Critical error during data seeding." });
  }
};