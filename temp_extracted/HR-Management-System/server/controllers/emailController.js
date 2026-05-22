import { sendEmail } from "../utils/sendEmail.js";
import { buildEmailTemplate } from "../utils/emailTemplate.js";


export const sendCustomEmail = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not allowed" });
    }

    const { to, subject, message } = req.body;

    const html = buildEmailTemplate({
      title: subject,
      color: "#4f46e5",
      message: `
        <p style="margin-bottom:24px; font-size:16px; color:#0f172a;"><b>Important Update</b></p>
        
        <div style="color:#475569; font-size:15px; line-height:1.7;">
          ${message.replace(/\n/g, '<br/>')}
        </div>

        <div style="margin-top:40px; padding-top:24px; border-top:1px solid #f1f5f9; color:#94a3b8; font-size:13px;">
          Best regards,<br/>
          <b style="color:#475569;">Human Resources Team</b>
        </div>
      `
    });

    await sendEmail({
      to,
      subject,
      html
    });

    res.json({ msg: "Email sent" });
  } catch (err) {
    res.status(500).json({ msg: "Email failed" });
  }
};