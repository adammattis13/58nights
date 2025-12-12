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

    // Send email via Resend
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: '58Nights Media <onboarding@resend.dev>',
                to: process.env.NOTIFY_EMAIL || 'amattis@mattisco.com',
                reply_to: email,
                subject: `New Contact: ${name}`,
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
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Resend error:', result);
            throw new Error(result.message || 'Failed to send email');
        }

        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
        console.error('Email error:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to send email. Please try again later.' 
        });
    }
}
