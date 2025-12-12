const nodemailer = require('nodemailer');

// Store submissions in memory (for serverless, consider using a database like Vercel KV or Supabase for persistence)
// This is just for the email functionality

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
        return res.status(400).json({ 
            success: false, 
            error: 'All fields are required' 
        });
    }

    // Send email
    try {
        await transporter.sendMail({
            from: `"58Nights Media" <${process.env.SMTP_USER}>`,
            to: process.env.NOTIFY_EMAIL || 'amattis@mattisco.com',
            replyTo: email,
            subject: `New Contact: ${name}`,
            text: `
Name: ${name}
Email: ${email}

Message:
${message}

---
Sent from 58Nights Media contact form
            `,
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 3px solid #d4872c; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { margin: 0; color: #0a0a0c; font-size: 24px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { margin-top: 4px; }
        .message { background: #f5f5f5; padding: 15px; border-left: 3px solid #d4872c; margin-top: 20px; }
        .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Contact Form Submission</h1>
        </div>
        <div class="field">
            <div class="label">Name</div>
            <div class="value">${name}</div>
        </div>
        <div class="field">
            <div class="label">Email</div>
            <div class="value"><a href="mailto:${email}">${email}</a></div>
        </div>
        <div class="message">
            <div class="label">Message</div>
            <div class="value">${message.replace(/\n/g, '<br>')}</div>
        </div>
        <div class="footer">
            Sent from 58Nights Media contact form
        </div>
    </div>
</body>
</html>
            `
        });

        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
        console.error('Email error:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to send email. Please try again later.' 
        });
    }
}
