# EmailJS Setup Guide for PQRS Notifications

This guide will help you set up email notifications when PQRS are assigned to personnel.

## 🚀 Free Email Service Setup

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email

### Step 2: Set Up Email Service
1. In your EmailJS dashboard, click **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Connect your email account
5. Note down the **Service ID**

### Step 3: Create Email Template
1. Click **"Email Templates"**
2. Click **"Create New Template"**
3. Use this template structure:

**Subject:**
```
Nueva asignación PQRS: {{pqrs_title}}
```

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nueva Asignación PQRS</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Nueva Asignación de PQRS</h2>

        <p>Hola <strong>{{personnel_name}}</strong>,</p>

        <p>Se le ha asignado una nueva PQRS para atención:</p>

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #dc2626;">{{pqrs_title}}</h3>
            <p><strong>Tipo:</strong> {{pqrs_type}}</p>
            <p><strong>Prioridad:</strong> {{pqrs_priority}}</p>
            <p><strong>Zona:</strong> {{zone_name}}</p>
        </div>

        <p><strong>Detalles de la asignación:</strong></p>
        <p>{{assignment_details}}</p>

        <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>⚠️ Acción requerida:</strong> Por favor revise los detalles en el sistema y proceda con la atención inmediata.</p>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
            Este es un mensaje automático del Sistema de Gestión PQRS de la Secretaría de Infraestructura Física.
        </p>
    </div>
</body>
</html>
```

4. Save the template
5. Note down the **Template ID**

### Step 4: Get Public Key
1. Go to **"Account"** in EmailJS dashboard
2. Copy your **Public Key**

### Step 5: Configure Environment Variables
Update your `.env.local` file with the EmailJS credentials:

```env
# EmailJS Configuration (Free Service)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_actual_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_actual_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_actual_public_key
```

## 📱 SMS Notifications (Optional)

For SMS notifications, you can integrate with:
- **Twilio** (Free trial available)
- **AWS SNS**
- **MessageBird**

Example Twilio integration would require:
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## 🧪 Testing Notifications

1. **Mock Notifications**: The system includes mock notifications for testing
2. **Console Logs**: Check browser console for notification details
3. **Email Testing**: Use EmailJS dashboard to test email templates

## 📋 Notification Features

✅ **Automatic Triggers**: Sent when PQRS are assigned via AI
✅ **Personnel Details**: Includes assigned personnel information
✅ **PQRS Context**: Full details about the request
✅ **Priority Indicators**: Visual priority levels
✅ **Geographic Info**: Zone and location details
✅ **Fallback System**: Mock notifications if email fails

## 🔧 Troubleshooting

### Email Not Sending
1. Check EmailJS credentials in `.env.local`
2. Verify email service connection in EmailJS dashboard
3. Check browser console for errors

### Template Issues
1. Ensure all template variables match the code
2. Test template in EmailJS dashboard first
3. Check for special characters in content

### Mock Notifications Only
If real emails aren't working, the system will automatically use mock notifications with console logging.

---

**🎉 Your PQRS notification system is now ready! Personnel will receive instant notifications when assigned to new requests.**