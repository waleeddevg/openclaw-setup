import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function sendOrderNotification(orderData: {
  full_name: string
  email: string
  whatsapp: string
  vps_provider: string
  vps_ip: string
  additional_notes?: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log('Resend not configured, skipping email notification')
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'ClawSetup AI <orders@clawsetup.ai>',
      to: ADMIN_EMAIL,
      subject: `New Order: ${orderData.full_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5cf6;">New Order Received</h2>
          <p>A new order has been submitted on ClawSetup AI.</p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Name:</strong> ${orderData.full_name}</p>
            <p><strong>Email:</strong> ${orderData.email}</p>
            <p><strong>WhatsApp:</strong> ${orderData.whatsapp}</p>
            <p><strong>VPS Provider:</strong> ${orderData.vps_provider}</p>
            <p><strong>VPS IP:</strong> ${orderData.vps_ip}</p>
            ${orderData.additional_notes ? `<p><strong>Notes:</strong> ${orderData.additional_notes}</p>` : ''}
          </div>
          
          <p>
            <a href="${APP_URL}/dashboard/orders" 
               style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View in Dashboard
            </a>
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

export async function sendOrderConfirmation(customerEmail: string, orderDetails: {
  full_name: string
  vps_provider: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log('Resend not configured, skipping confirmation email')
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'ClawSetup AI <support@clawsetup.ai>',
      to: customerEmail,
      subject: 'Order Confirmation - ClawSetup AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5cf6;">Thank you for your order!</h2>
          <p>Hi ${orderDetails.full_name},</p>
          <p>We've received your order for OpenClaw AI setup. Our team will begin working on your setup shortly.</p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>VPS Provider:</strong> ${orderDetails.vps_provider}</p>
            <p><strong>Status:</strong> Pending</p>
          </div>
          
          <p>We'll contact you via WhatsApp with updates on your setup progress.</p>
          
          <p>Best regards,<br>The ClawSetup AI Team</p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send confirmation:', error)
    return { success: false, error }
  }
}
