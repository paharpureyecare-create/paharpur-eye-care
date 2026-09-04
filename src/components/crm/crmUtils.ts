import { Customer, SpectacleOrder, ClinicalVisit, PaymentRecord, CustomerSegmentRule, ClinicSettings, OfferPromotion, WhatsAppTemplate } from '../../types';

export interface DynamicDataPayload {
  customer?: Customer;
  patientName?: string;
  doctorName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  orderId?: string;
  deliveryDate?: string;
  totalAmount?: number | string;
  paidAmount?: number | string;
  dueAmount?: number | string;
  discount?: number | string;
  offerCode?: string;
  offerName?: string;
  validityDate?: string;
  expiryDate?: string;
  powerDetails?: string;
  lensType?: string;
  frameModel?: string;
  invoiceNumber?: string;
}

export function replaceTemplateVariables(
  templateText: string,
  payload: DynamicDataPayload,
  settings: ClinicSettings
): string {
  if (!templateText) return '';
  let result = templateText;

  const clinicName = settings.shopName || 'PAHARPUR EYE CARE';
  const clinicPhone = settings.whatsapp || settings.mobile || '+91 98301 23456';
  const clinicAddress = settings.address || 'Paharpur Main Road, Optical Complex, West Bengal';
  const docName = payload.doctorName || settings.doctorName || 'Dr. S. K. Banerjee (Eye Specialist)';

  const custName = payload.customer?.name || payload.patientName || 'Customer';
  const dueAmt = payload.dueAmount !== undefined ? String(payload.dueAmount) : (payload.customer?.outstandingDue ? String(payload.customer.outstandingDue) : '0');
  const totalAmt = payload.totalAmount !== undefined ? String(payload.totalAmount) : '0';
  const paidAmt = payload.paidAmount !== undefined ? String(payload.paidAmount) : '0';

  // Replacements
  result = result.replace(/\{Customer_Name\}|\{Patient_Name\}/gi, custName);
  result = result.replace(/\{Doctor_Name\}/gi, docName);
  result = result.replace(/\{Shop_Name\}|\{Clinic_Name\}/gi, clinicName);
  result = result.replace(/\{Shop_Address\}|\{Clinic_Address\}/gi, clinicAddress);
  result = result.replace(/\{Shop_Mobile\}|\{Clinic_Phone\}|\{Shop_Phone\}/gi, clinicPhone);
  result = result.replace(/\{Order_ID\}|\{Order_Id\}/gi, payload.orderId || 'ORD-2026');
  result = result.replace(/\{Invoice_ID\}|\{Invoice_Id\}|\{Invoice_No\}/gi, payload.invoiceNumber || payload.orderId || 'INV-2026');
  result = result.replace(/\{Appointment_Date\}/gi, payload.appointmentDate || new Date().toISOString().split('T')[0]);
  result = result.replace(/\{Appointment_Time\}/gi, payload.appointmentTime || '11:00 AM');
  result = result.replace(/\{Delivery_Date\}/gi, payload.deliveryDate || 'Ready Now');
  result = result.replace(/\{Total_Amount\}/gi, totalAmt);
  result = result.replace(/\{Paid_Amount\}/gi, paidAmt);
  result = result.replace(/\{Due_Amount\}/gi, dueAmt);
  result = result.replace(/\{Discount\}/gi, String(payload.discount || '15%'));
  result = result.replace(/\{Offer_Code\}/gi, payload.offerCode || 'PEC2026');
  result = result.replace(/\{Offer_Name\}/gi, payload.offerName || 'Special Privilege Offer');
  result = result.replace(/\{Validity_Date\}|\{Expiry_Date\}/gi, payload.validityDate || payload.expiryDate || 'Limited Period');
  result = result.replace(/\{Lens_Type\}/gi, payload.lensType || 'Anti-Glare / Blue Cut');
  result = result.replace(/\{Frame_Model\}/gi, payload.frameModel || 'Optical Frame');
  result = result.replace(/\{Power_Details\}/gi, payload.powerDetails || 'Standard Vision');

  return result;
}

export function openWhatsAppDirect(mobile: string, messageText: string): void {
  const cleaned = (mobile || '').replace(/[^0-9]/g, '');
  const formatted = cleaned.length === 10 ? `91${cleaned}` : cleaned;
  const encoded = encodeURIComponent(messageText);
  const waUrl = `https://wa.me/${formatted}?text=${encoded}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}

export function filterCustomersBySegment(
  customers: Customer[],
  segment: CustomerSegmentRule,
  spectacleOrders: SpectacleOrder[] = [],
  visits: ClinicalVisit[] = []
): Customer[] {
  const now = new Date();
  const criteria = segment.criteria || {};

  return customers.filter(cust => {
    // 1. Min / Max Purchase Value
    const custLtv = cust.lifetimeValue || cust.totalPurchases || 0;
    if (criteria.minTotalPurchase !== undefined && custLtv < criteria.minTotalPurchase) {
      return false;
    }
    if (criteria.maxTotalPurchase !== undefined && custLtv > criteria.maxTotalPurchase) {
      return false;
    }

    // 2. Outstanding Due condition
    if (criteria.minDue !== undefined && (cust.outstandingDue || 0) < criteria.minDue) {
      return false;
    }

    // 3. Opt-in status
    if (criteria.whatsappOptInOnly) {
      if (cust.whatsappMarketingStatus === 'Opted Out') {
        return false;
      }
    }

    // 4. Inactivity days / Last purchase days
    if (criteria.inactiveDays) {
      const lastContactDate = cust.lastPurchaseDate || cust.lastContact;
      if (!lastContactDate) return false;
      const lastContactTime = new Date(lastContactDate).getTime();
      const daysDiff = (now.getTime() - lastContactTime) / (1000 * 60 * 60 * 24);
      if (daysDiff < criteria.inactiveDays) {
        return false;
      }
    }

    // 5. Product Category Filters (e.g. Progressive Lens wearers, Blue Cut users)
    if (criteria.productType && criteria.productType !== 'All') {
      const custOrders = spectacleOrders.filter(o => o.customerId === cust.customerId || o.mobile === cust.mobile);
      const matchesCategory = custOrders.some(ord => {
        const desc = `${ord.lensType || ''} ${ord.frameModel || ''}`.toLowerCase();
        return desc.includes(criteria.productType!.toLowerCase());
      });
      if (!matchesCategory && custOrders.length > 0) return false;
    }

    // 6. Checkup Recall (e.g. Rx older than 300 days)
    if (criteria.annualRecallDue || segment.id === 'SEG-RECALL-01' || segment.name.toLowerCase().includes('recall')) {
      const custVisits = visits.filter(v => v.mrd === cust.mrd || (cust.mobile && v.mobile === cust.mobile));
      const custOrders = spectacleOrders.filter(o => o.customerId === cust.customerId || o.mobile === cust.mobile);
      
      const latestDateStr = custVisits[0]?.visitDate || custOrders[0]?.orderDate || cust.lastContact;
      if (!latestDateStr) return false;
      const daysSince = (now.getTime() - new Date(latestDateStr).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince >= 300; // ~10-12 months
    }

    // 7. Ready Orders Segment
    if (segment.id === 'SEG-READY-01' || segment.name.toLowerCase().includes('ready')) {
      const readyOrders = spectacleOrders.filter(o => (o.customerId === cust.customerId || o.mobile === cust.mobile) && o.status === 'Ready');
      return readyOrders.length > 0;
    }

    return true;
  });
}

export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || isNaN(amount)) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateString;
  }
}
