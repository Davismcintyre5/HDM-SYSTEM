export const printContent = (contentHtml, title = 'Print', settings = null, skipWrapper = false) => {
  if (skipWrapper) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>${title}</title><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>*{margin:0;padding:0;box-sizing:border-box}@page{size:A4 portrait;margin:0.2in}html,body{height:100%;width:100%;background:white}body{display:flex;align-items:center;justify-content:center;font-family:'Georgia','Times New Roman',serif}.certificate-container{width:100%;height:100%;display:flex;align-items:center;justify-content:center}.certificate-content{width:100%;height:100%;display:flex;flex-direction:column;justify-content:space-between}@media print{body{margin:0;padding:0}}</style>
      </head><body><div class="certificate-container"><div class="certificate-content">${contentHtml}</div></div></body></html>`);
    printWindow.document.close();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
    return;
  }

  const printWindow = window.open('', '_blank');
  const schoolName = settings?.schoolName || settings?.businessName || 'HDM Computer School';
  const motto = settings?.motto || 'Technology for Tomorrow';
  const address = settings?.address || '';
  const phone = settings?.phone || '';
  const email = settings?.email || '';
  const stampImage = settings?.stampImage || '';
  const now = new Date();
  const stampUrl = stampImage && stampImage.trim() ? `${stampImage}?t=${Date.now()}` : '';
  const stampHtml = stampUrl ? `<div class="stamp"><img src="${stampUrl}" alt="Official Stamp" style="max-width:100px;height:auto"/><div class="stamp-date">${now.toLocaleDateString()}</div></div>` : `<div class="stamp-placeholder">[Official Stamp]<div class="stamp-date">${now.toLocaleDateString()}</div></div>`;

  printWindow.document.write(`<!DOCTYPE html><html><head><title>${title}</title><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=yes">
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI','Times New Roman',Arial,sans-serif;background:white;margin:0;padding:20px}@media print{body{margin:0;padding:0}.watermark{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999}.watermark::after{content:"${schoolName}";position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-25deg);font-size:42px;font-weight:800;color:rgba(0,0,0,0.05);white-space:nowrap;letter-spacing:4px}header,main,footer{margin:0 auto;max-width:750px}main{page-break-inside:avoid}}header{text-align:center;margin-bottom:15px}h1{color:#0a2a44;border-bottom:2px solid #2f86eb;padding-bottom:8px;margin-bottom:8px;font-size:20px}.motto{font-style:italic;margin:4px 0;color:#2f86eb;font-size:12px}.address,.contact{margin:4px 0;font-size:12px}hr{margin:12px 0;border:none;border-top:1px solid #ddd}main{max-width:750px;margin:0 auto}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left;vertical-align:top;font-size:12px}th{background-color:#f2f2f2}footer{max-width:750px;margin:20px auto 0;text-align:center;font-size:10px;color:#666;border-top:1px solid #2f86eb;padding-top:12px}.stamp,.stamp-placeholder{text-align:right;margin-top:20px}.stamp img{max-width:100px;height:auto}.stamp-placeholder{height:80px;border-top:1px dashed #999;text-align:center;padding-top:12px;color:#999;font-size:11px}.stamp-date{font-size:11px;font-weight:bold;color:#2f86eb;margin-top:4px;text-align:right}</style>
    </head><body><div class="watermark"></div><header><h1>${schoolName}</h1>${motto?`<div class="motto">${motto}</div>`:''}<div class="address">${address}</div><div class="contact">📞 ${phone} | ✉️ ${email}</div><hr/></header><main>${contentHtml}</main><footer>${stampHtml}<div style="margin-top:10px"><p><strong>${schoolName}</strong> | ${address}</p><p>Printed: ${now.toLocaleString()}</p><p>${motto||'Thank you for your patronage. Visit again!'}</p></div></footer><script>window.onload=()=>{setTimeout(()=>{window.print();window.onafterprint=()=>window.close()},500)}</script></body></html>`);
  printWindow.document.close();
};

export default printContent;