export const buildEmailTemplate = ({
  title,
  message,
  color = "#4f46e5"
}) => {
  return `
    <div style="background-color:#f8fafc; padding:40px 20px; font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1e293b;">
      <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); border:1px solid #e2e8f0;">
        
        <div style="background-color:${color}; height:6px;"></div>

        <div style="padding:32px 32px 24px 32px; text-align:center;">
          <div style="display:inline-block; background-color:#f1f5f9; padding:12px; border-radius:12px; margin-bottom:16px;">
            <span style="font-size:24px; font-weight:900; color:#1e293b; letter-spacing:-1px;">OfficeLink</span>
          </div>
          <h1 style="margin:0; font-size:20px; font-weight:800; color:#0f172a; letter-spacing:-0.025em;">
            ${title}
          </h1>
        </div>

        <div style="padding:0 40px 40px 40px; font-size:15px; line-height:1.6; color:#475569;">
          ${message}
        </div>

        <div style="background-color:#f1f5f9; padding:24px; text-align:center; border-top:1px solid #e2e8f0;">
          
          <p style="margin:8px 0 0 0; font-size:12px; color:#64748b;">
            © ${new Date().getFullYear()} OfficeLink Inc. • Confidential Internal Access
          </p>
        </div>
      </div>
    </div>
  `;
};