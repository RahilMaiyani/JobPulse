// utils/pdfGenerator.js
import PDFDocument from "pdfkit";

export const createEncryptedPayslip = (user, payslipData, bankAccRaw) => {
  return new Promise((resolve) => {
    
    // Create Password: "rahi4210" (First 4 name + last 4 account)
    const namePart = user.name.substring(0, 4).toLowerCase();
    const accPart = bankAccRaw.slice(-4);
    const userPassword = `${namePart}${accPart}`;

    const doc = new PDFDocument({
      userPassword: userPassword,
      ownerPassword: process.env.ADMIN_PDF_PASSWORD,
      permissions: { printing: 'highres', modifying: false }
    });

    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // --- DRAW THE PDF (Using your Indigo theme concepts) ---
    doc.fontSize(20).fillColor('#4f46e5').text('OfficeLink', { align: 'center' });
    doc.fontSize(12).fillColor('#0f172a').text('Salary Statement', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(10).text(`Name: ${user.name}`);
    doc.text(`Month: ${payslipData.month} ${payslipData.year}`);
    doc.moveDown();

    doc.text(`Basic Pay: INR ${payslipData.earnings.basicPay}`);
    doc.text(`Special Allowance: INR ${payslipData.earnings.specialAllowance}`);
    doc.fillColor('#e11d48').text(`Loss of Pay Deduction: -INR ${payslipData.deductions.lossOfPay}`);
    
    doc.moveDown();
    doc.fontSize(14).fillColor('#166534').text(`Net Take-Home: INR ${payslipData.netPay}`);

    doc.end();
  });
};