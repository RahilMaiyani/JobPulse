const buildEmailTemplate = ({
  title,
  message,
  color = "#6366f1"
}) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; background-color: #f4f4f5; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);">
              
              <!-- Top color bar -->
              <tr>
                <td style="background-color: ${color}; height: 6px; width: 100%;"></td>
              </tr>

              <!-- Header -->
              <tr>
                <td align="center" style="padding: 40px 40px 20px 40px;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="background-color: #18181b; border-radius: 14px; padding: 12px 20px; display: inline-block;">
                        <span style="font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; mso-line-height-rule: exactly;">
                          JobPulse<span style="color: ${color};">.</span>
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Title -->
              <tr>
                <td align="center" style="padding: 0 40px 10px 40px;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #09090b; letter-spacing: -0.025em; line-height: 1.2;">
                    ${title}
                  </h1>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td align="center" style="padding: 10px 40px;">
                  <div style="height: 1px; width: 40px; background-color: #e4e4e7; border-radius: 1px;"></div>
                </td>
              </tr>

              <!-- Message Body -->
              <tr>
                <td style="padding: 20px 40px 40px 40px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
                  ${message}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #fafafa; padding: 30px 40px; border-top: 1px solid #f4f4f5; text-align: center;">
                  <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600; color: #71717a;">
                    JobPulse Talent Acquisition
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 1.5;">
                    © ${new Date().getFullYear()} JobPulse. All rights reserved.<br>
                    This is an automated message. Please do not reply directly to this email.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

module.exports = { buildEmailTemplate };
