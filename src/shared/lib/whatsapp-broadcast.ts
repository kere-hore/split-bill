interface WhatsAppBroadcastData {
  memberName: string;
  groupName: string;
  merchantName?: string;
  totalAmount: number;
  memberUrl: string;
}

export function generateWhatsAppMessage(data: WhatsAppBroadcastData): string {
  const { memberName, groupName, merchantName, totalAmount, memberUrl } = data;
  
  const message = `Hi ${memberName}! 👋

Your bill allocation for *${groupName}* is ready:
${merchantName ? `📍 ${merchantName}` : ''}
💰 Your share: Rp ${totalAmount.toLocaleString()}

View your detailed breakdown here:
${memberUrl}

Please check and let us know if you have any questions! 😊`;

  return message;
}

export function generateWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function openWhatsApp(phone: string, message: string): void {
  const url = generateWhatsAppUrl(phone, message);
  window.open(url, '_blank');
}