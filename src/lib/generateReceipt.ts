import { format } from 'date-fns';

export interface ReceiptData {
  paymentId: string;
  studentName: string;
  studentClass: string;
  schoolName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId?: string;
}

export const generateReceiptHTML = (data: ReceiptData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Receipt - ${data.paymentId}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
        .receipt { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 24px; margin-bottom: 5px; }
        .header p { opacity: 0.9; font-size: 14px; }
        .badge { display: inline-block; background: #10b981; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 15px; }
        .content { padding: 30px; }
        .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
        .row:last-child { border-bottom: none; }
        .label { color: #666; font-size: 14px; }
        .value { font-weight: 600; color: #1e3a5f; font-size: 14px; text-align: right; }
        .amount-row { background: #f0fdf4; margin: 20px -30px; padding: 20px 30px; }
        .amount-row .label { color: #065f46; font-weight: 600; }
        .amount-row .value { color: #10b981; font-size: 24px; }
        .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; }
        .footer p { margin-bottom: 5px; }
        @media print { body { padding: 0; background: white; } .receipt { box-shadow: none; } }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1>${data.schoolName}</h1>
          <p>Fee Payment Receipt</p>
          <span class="badge">✓ Payment Successful</span>
        </div>
        <div class="content">
          <div class="row">
            <span class="label">Receipt No</span>
            <span class="value">${data.paymentId.slice(0, 8).toUpperCase()}</span>
          </div>
          <div class="row">
            <span class="label">Student Name</span>
            <span class="value">${data.studentName}</span>
          </div>
          <div class="row">
            <span class="label">Class</span>
            <span class="value">${data.studentClass}</span>
          </div>
          <div class="row">
            <span class="label">Payment Date</span>
            <span class="value">${format(new Date(data.paymentDate), 'dd MMM yyyy, hh:mm a')}</span>
          </div>
          <div class="row">
            <span class="label">Payment Method</span>
            <span class="value">${data.paymentMethod}</span>
          </div>
          ${data.transactionId ? `
          <div class="row">
            <span class="label">Transaction ID</span>
            <span class="value">${data.transactionId}</span>
          </div>
          ` : ''}
          <div class="row amount-row">
            <span class="label">Amount Paid</span>
            <span class="value">₹${data.amount.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div class="footer">
          <p>This is a computer-generated receipt.</p>
          <p>For any queries, please contact the school administration.</p>
          <p style="margin-top: 10px; color: #999;">Generated on ${format(new Date(), 'dd MMM yyyy, hh:mm a')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const downloadReceipt = (data: ReceiptData) => {
  const html = generateReceiptHTML(data);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};
