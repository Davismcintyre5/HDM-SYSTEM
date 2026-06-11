// utils/print.js

export const printDocument = ({ title = 'Print', content = '', headHTML = '', footerHTML = '' }) => {
  const w = window.open('', '_blank', 'width=520,height=650');
  if (!w) {
    alert('Please allow popups for this site to print.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <meta charset="utf-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; max-width: 480px; margin: auto; color: #111; }
        .header { text-align: center; margin-bottom: 14px; padding-bottom: 10px; }
        .content { margin: 12px 0; }
        .footer { text-align: center; font-size: 11px; color: #999; margin-top: 18px; padding-top: 10px; border-top: 1px dashed #ccc; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f0f4ff; color: #1a56db; padding: 6px 8px; text-align: left; font-size: 11px; text-transform: uppercase; }
        td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 13px; }
        @media print { 
          body { padding: 10px; max-width: 100%; } 
          @page { margin: 8mm; size: auto; }
        }
      </style>
    </head>
    <body>
      <div class="header">${headHTML}</div>
      <div class="content">${content}</div>
      <div class="footer">${footerHTML}</div>
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() { window.close(); };
        };
      </script>
    </body>
    </html>
  `;

  w.document.write(html);
  w.document.close();
};

export const receiptHeader = ({ businessName = 'Business Name', address = '', phone = '', email = '' }) => `
  <h2 style="color:#2563eb;margin:0;font-size:18px;">${businessName}</h2>
  ${address ? `<p style="margin:2px 0;font-size:11px;color:#666;">📍 ${address}</p>` : ''}
  ${phone ? `<p style="margin:2px 0;font-size:11px;color:#666;">📞 ${phone}</p>` : ''}
  ${email ? `<p style="margin:2px 0;font-size:11px;color:#666;">✉️ ${email}</p>` : ''}
  <div style="border-top:2px solid #2563eb;margin:8px 0;"></div>
`;

export const receiptFooter = (text = 'Thank you for your business!') => `
  <p style="margin:0;">${text}</p>
  <p style="margin:2px 0 0;font-size:10px;">Printed: ${new Date().toLocaleString()}</p>
`;

export default printDocument;