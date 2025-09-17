import emailjs from '@emailjs/browser'

// EmailJS configuration - You'll need to set these up in your EmailJS account
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || ''
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || ''
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''

// Initialize EmailJS
if (typeof window !== 'undefined' && EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY)
}

export interface NotificationData {
  to_email?: string
  to_phone?: string
  personnel_name: string
  pqrs_title: string
  pqrs_type: string
  pqrs_priority: string
  zone_name?: string
  assignment_details: string
}

export class NotificationService {
  static async sendAssignmentNotification(data: NotificationData) {
    try {
      // Send email notification
      if (data.to_email && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID) {
        await this.sendEmailNotification(data)
      }

      // For SMS, you would integrate with a service like Twilio
      // This is a placeholder for SMS functionality
      if (data.to_phone) {
        console.log('SMS notification would be sent to:', data.to_phone)
        // await this.sendSMSNotification(data)
      }

      console.log('Notification sent successfully:', data)
    } catch (error) {
      console.error('Failed to send notification:', error)
      throw error
    }
  }

  private static async sendEmailNotification(data: NotificationData) {
    const templateParams = {
      to_email: data.to_email,
      personnel_name: data.personnel_name,
      pqrs_title: data.pqrs_title,
      pqrs_type: data.pqrs_type,
      pqrs_priority: data.pqrs_priority,
      zone_name: data.zone_name || 'No especificada',
      assignment_details: data.assignment_details,
      subject: `Nueva asignación PQRS: ${data.pqrs_title}`
    }

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    )
  }

  private static async sendSMSNotification(data: NotificationData) {
    // Placeholder for SMS service integration
    // You would integrate with Twilio, AWS SNS, or similar service here
    console.log('Sending SMS to:', data.to_phone, 'Message:', this.generateSMSMessage(data))
  }

  private static generateSMSMessage(data: NotificationData): string {
    return `PQRS Asignada: ${data.pqrs_title}
Tipo: ${data.pqrs_type}
Prioridad: ${data.pqrs_priority}
Zona: ${data.zone_name || 'No especificada'}
Detalles: ${data.assignment_details}`
  }

  static generateAssignmentMessage(pqrsData: any, personnelData: any, zoneData?: any): NotificationData {
    return {
      to_email: personnelData.contact_info?.email,
      to_phone: personnelData.contact_info?.phone,
      personnel_name: `${personnelData.first_name} ${personnelData.last_name}`,
      pqrs_title: pqrsData.title,
      pqrs_type: pqrsData.type,
      pqrs_priority: pqrsData.priority,
      zone_name: zoneData?.name,
      assignment_details: `Se le ha asignado la PQRS "${pqrsData.title}" para atención inmediata. Por favor revise los detalles en el sistema.`
    }
  }
}

// Mock notification for development/testing
export const mockNotification = (data: NotificationData) => {
  console.log('🔔 MOCK NOTIFICATION SENT:')
  console.log('To:', data.to_email || data.to_phone)
  console.log('Subject:', `Nueva asignación PQRS: ${data.pqrs_title}`)
  console.log('Message:', data.assignment_details)
  console.log('Priority:', data.pqrs_priority)
  console.log('Zone:', data.zone_name)
}