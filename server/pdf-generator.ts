import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import type { Simulation } from '@shared/schema';

export async function generateSimulationPDF(simulation: Simulation, baseUrl: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Generate QR code for sharing
    const shareUrl = simulation.shareToken 
      ? `${baseUrl}/share/${simulation.shareToken}` 
      : baseUrl;
    const qrCodeDataUrl = await QRCode.toDataURL(shareUrl);
    
    const inputData = simulation.inputData as any;
    const resultData = simulation.resultData as any;
    
    // Build HTML content
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>CalcuNotaire Pro - Simulation ${simulation.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1a1a1a;
      line-height: 1.6;
      padding: 40px;
    }
    .header {
      border-bottom: 4px solid #1e3a8a;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #1e3a8a;
      font-size: 28px;
      margin-bottom: 5px;
    }
    .header p {
      color: #6b7280;
      font-size: 14px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      background: #f3f4f6;
      padding: 10px 15px;
      font-size: 18px;
      font-weight: 600;
      color: #1e3a8a;
      margin-bottom: 15px;
      border-left: 4px solid #1e3a8a;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }
    .info-item {
      padding: 12px;
      background: #f9fafb;
      border-radius: 4px;
    }
    .info-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
    }
    .result-box {
      background: #ecfdf5;
      border: 2px solid #10b981;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
    .result-box h3 {
      color: #065f46;
      margin-bottom: 15px;
    }
    .result-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #d1fae5;
    }
    .result-row:last-child {
      border-bottom: none;
      font-size: 20px;
      font-weight: bold;
      padding-top: 15px;
      margin-top: 10px;
      border-top: 2px solid #10b981;
    }
    .formula {
      background: #fffbeb;
      border-left: 3px solid #f59e0b;
      padding: 15px;
      margin: 15px 0;
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }
    .formula-title {
      font-weight: 600;
      color: #92400e;
      margin-bottom: 8px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
    }
    .legal {
      font-size: 10px;
      color: #6b7280;
      line-height: 1.4;
      margin-bottom: 15px;
    }
    .qr-section {
      text-align: center;
      margin-top: 20px;
    }
    .qr-section img {
      width: 120px;
      height: 120px;
    }
    .timestamp {
      text-align: right;
      font-size: 11px;
      color: #9ca3af;
      margin-top: 10px;
    }
    .certified {
      background: #eff6ff;
      border: 1px solid #3b82f6;
      padding: 15px;
      border-radius: 6px;
      margin-top: 20px;
    }
    .certified-title {
      color: #1e40af;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .alert {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px;
      margin: 15px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f3f4f6;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 CalcuNotaire Pro</h1>
    <p>Simulation de Plus-Value Immobilière</p>
    <p style="margin-top: 5px;">Réf: ${simulation.id.substring(0, 8).toUpperCase()}</p>
  </div>

  <div class="section">
    <div class="section-title">📋 Informations du bien</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Type de vendeur</div>
        <div class="info-value">${inputData.role === 'pp' ? 'Personne Physique' : inputData.role === 'sci_ir' ? 'SCI IR' : 'SCI IS'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Occupation</div>
        <div class="info-value">${inputData.occupation === 'rp' ? 'Résidence Principale' : inputData.occupation === 'rs' ? 'Résidence Secondaire' : 'Première vente'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Prix d'acquisition</div>
        <div class="info-value">${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(inputData.purchasePrice)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Prix de cession</div>
        <div class="info-value">${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(inputData.salePrice)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Date d'acquisition</div>
        <div class="info-value">${new Date(inputData.purchaseDate).toLocaleDateString('fr-FR')}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Date de cession</div>
        <div class="info-value">${new Date(inputData.saleDate).toLocaleDateString('fr-FR')}</div>
      </div>
    </div>
  </div>

  ${resultData.isRpExempt ? `
  <div class="alert">
    <strong>✅ Exonération Résidence Principale</strong><br>
    Cette vente bénéficie d'une exonération totale d'impôt sur la plus-value (article 150 U du CGI).
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">🧮 Calculs détaillés (formules BOFiP)</div>
    
    <div class="formula">
      <div class="formula-title">Plus-value brute</div>
      Prix de cession - Prix d'acquisition corrigé<br>
      = ${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(inputData.salePrice)} - ${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(resultData.acquisitionBase || inputData.purchasePrice)}<br>
      = <strong>${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(resultData.grossCapitalGain)}</strong>
    </div>

    ${!resultData.isRpExempt && !resultData.isFirstSaleExempt ? `
    <div class="formula">
      <div class="formula-title">Abattements pour durée de détention (${resultData.holdingYears} ans)</div>
      • IR (19%) : ${resultData.irAllowancePercent}% d'abattement<br>
      • PS (17.2%) : ${resultData.psAllowancePercent}% d'abattement
    </div>

    <table>
      <tr>
        <th>Impôt</th>
        <th>Base taxable</th>
        <th>Taux</th>
        <th>Montant</th>
      </tr>
      <tr>
        <td>Impôt sur le revenu</td>
        <td>${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(resultData.irTaxableBase)}</td>
        <td>19%</td>
        <td><strong>${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(resultData.irTax)}</strong></td>
      </tr>
      <tr>
        <td>Prélèvements sociaux</td>
        <td>${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(resultData.psTaxableBase)}</td>
        <td>17.2%</td>
        <td><strong>${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(resultData.psTax)}</strong></td>
      </tr>
      ${resultData.surcharge > 0 ? `
      <tr>
        <td>Surtaxe (PV &gt; 50k€)</td>
        <td colspan="2">${resultData.surchangeTranche}</td>
        <td><strong>${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(resultData.surcharge)}</strong></td>
      </tr>
      ` : ''}
    </table>
    ` : ''}
  </div>

  <div class="result-box">
    <h3>💰 Résumé financier</h3>
    <div class="result-row">
      <span>Plus-value brute</span>
      <span>${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(resultData.grossCapitalGain)}</span>
    </div>
    <div class="result-row">
      <span>Impôt sur le revenu (19%)</span>
      <span>${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(resultData.irTax || 0)}</span>
    </div>
    <div class="result-row">
      <span>Prélèvements sociaux (17.2%)</span>
      <span>${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(resultData.psTax || 0)}</span>
    </div>
    ${resultData.surcharge > 0 ? `
    <div class="result-row">
      <span>Surtaxe</span>
      <span>${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(resultData.surcharge)}</span>
    </div>
    ` : ''}
    <div class="result-row">
      <span>Total impôts</span>
      <span>${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(resultData.totalTax || 0)}</span>
    </div>
    <div class="result-row">
      <span>Net vendeur</span>
      <span style="color: #065f46;">${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'}).format(resultData.netProceeds)}</span>
    </div>
  </div>

  <div class="certified">
    <div class="certified-title">✓ Certification du document</div>
    <p style="font-size: 12px; color: #1e40af;">
      Ce document a été généré automatiquement par CalcuNotaire Pro le ${new Date().toLocaleString('fr-FR')}.<br>
      Les calculs sont basés sur les formules officielles du Bulletin Officiel des Finances Publiques (BOFiP).<br>
      Version du moteur de calcul: v1.0.0
    </p>
  </div>

  <div class="footer">
    <div class="legal">
      <strong>MENTIONS LÉGALES</strong><br>
      Ce document constitue une simulation indicative et ne saurait se substituer à l'avis d'un professionnel (notaire, avocat fiscaliste, expert-comptable). 
      CalcuNotaire Pro ne peut être tenu responsable des décisions prises sur la base de ce document. Les taux d'imposition et réglementations fiscales 
      sont susceptibles d'évoluer. Il est recommandé de consulter un professionnel pour valider ces calculs avant toute transaction immobilière.
      <br><br>
      <strong>SOURCES RÉGLEMENTAIRES :</strong><br>
      • Code Général des Impôts (CGI) - Articles 150 U à 150 VH<br>
      • Bulletin Officiel des Finances Publiques (BOFiP) - BOI-RFPI-PVI<br>
      • Loi de finances 2024<br>
      • Barème des abattements pour durée de détention (Art. 150 VC du CGI)
    </div>

    <div class="qr-section">
      <img src="${qrCodeDataUrl}" alt="QR Code" />
      <p style="font-size: 11px; color: #6b7280; margin-top: 8px;">Scannez pour accéder à cette simulation</p>
    </div>

    <div class="timestamp">
      Document généré le ${new Date().toLocaleString('fr-FR', { 
        dateStyle: 'full', 
        timeStyle: 'long' 
      })}<br>
      CalcuNotaire Pro © 2024 - Tous droits réservés
    </div>
  </div>
</body>
</html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
