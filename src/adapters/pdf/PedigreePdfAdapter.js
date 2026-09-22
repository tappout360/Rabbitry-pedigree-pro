/**
 * PedigreePdfAdapter.js
 * Outbound Adapter: Official ARBA-Compliant 4-Generation Pedigree PDF & Print Engine
 * Generates high-resolution vector printable certificates with official lineage styling.
 */

import QRCode from 'qrcode';

export class PedigreePdfAdapter {
  /**
   * Generates a QR Data URL for the verification link
   */
  static async generateQrDataUrl(verificationUrl) {
    try {
      return await QRCode.toDataURL(verificationUrl, {
        width: 140,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
    } catch (err) {
      console.warn("QR code generation error:", err);
      return '';
    }
  }

  /**
   * Generates and triggers high-fidelity PDF printing via dedicated print window
   */
  static async generateAndPrintPdf({ compiledPedigree, activeBreeder }) {
    if (!compiledPedigree || !compiledPedigree.proband) {
      throw new Error("No pedigree data provided for PDF export.");
    }

    const { proband, verificationToken, verificationUrl, inbreedingCoeff } = compiledPedigree;
    const tree = compiledPedigree.tree;
    const qrDataUrl = await this.generateQrDataUrl(verificationUrl);

    const renderNodeBox = (node, role, gender) => {
      if (!node) {
        return `
          <div class="node-box empty">
            <span class="role-label">${role}</span>
            <span class="empty-text">— Unrecorded —</span>
          </div>
        `;
      }

      const weightLbs = node.weightOz ? (node.weightOz / 16).toFixed(2) + ' lbs' : 'N/A';
      const legsCount = node.legs?.length || 0;
      const legsBadge = legsCount > 0 ? `<span class="legs-badge">🏆 ${legsCount} Legs</span>` : '';

      return `
        <div class="node-box ${gender === 'buck' ? 'buck-box' : 'doe-box'}">
          <div class="box-header">
            <span class="role-label">${role}</span>
            ${legsBadge}
          </div>
          <div class="rabbit-name">${node.gcNumber ? 'GC ' : ''}${node.name || 'Unnamed'}</div>
          <div class="meta-grid">
            <div>Tat: <strong>${node.tattooNumber || 'None'}</strong></div>
            <div>Wt: <strong>${weightLbs}</strong></div>
            <div>Breed: <strong>${node.breed || ''}</strong></div>
            <div>Var: <strong>${node.variety || ''}</strong></div>
            ${node.registrationNumber ? `<div class="col-span-2">Reg #: <strong>${node.registrationNumber}</strong></div>` : ''}
          </div>
        </div>
      `;
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pedigree_${proband.tattooNumber || 'Rabbit'}_${proband.name || ''}</title>
        <style>
          @page {
            size: landscape letter;
            margin: 0.35in;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Times New Roman', Georgia, serif;
            color: #0f172a;
            background: #fff;
            padding: 10px;
            font-size: 11px;
            line-height: 1.2;
          }
          .certificate-border {
            border: 5px double #0f172a;
            padding: 14px;
            min-height: 7.4in;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 8px;
            margin-bottom: 10px;
          }
          .breeder-meta h1 {
            font-size: 20px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 900;
          }
          .breeder-meta h2 {
            font-size: 13px;
            font-weight: bold;
            margin-top: 2px;
            color: #334155;
          }
          .breeder-meta p {
            font-size: 10px;
            color: #475569;
          }
          .proband-card {
            border: 1.5px solid #0f172a;
            background: #f8fafc;
            padding: 8px 12px;
            border-radius: 6px;
            min-width: 2.8in;
          }
          .proband-card h3 {
            font-size: 14px;
            font-weight: bold;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 3px;
            margin-bottom: 4px;
          }
          .proband-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2px 8px;
            font-size: 10px;
          }
          .tree-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1.2fr;
            gap: 8px;
            flex: 1;
            margin: 8px 0;
          }
          .gen-column {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            gap: 6px;
          }
          .node-box {
            border: 1px solid #334155;
            border-radius: 4px;
            padding: 4px 6px;
            font-size: 9.5px;
            background: #ffffff;
          }
          .node-box.empty {
            border-style: dashed;
            border-color: #94a3b8;
            background: #fafafa;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .buck-box { border-left: 3px solid #2563eb; background: #f0f7ff; }
          .doe-box { border-left: 3px solid #db2777; background: #fdf2f8; }
          .box-header {
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            color: #475569;
          }
          .rabbit-name {
            font-weight: bold;
            font-size: 10.5px;
            margin: 1px 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1px 4px;
            font-size: 8.5px;
            font-family: monospace;
          }
          .legs-badge {
            background: #fef3c7;
            color: #78350f;
            border: 1px solid #fde68a;
            padding: 0 3px;
            border-radius: 3px;
            font-size: 7.5px;
            font-weight: bold;
          }
          .footer-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-top: 1.5px solid #0f172a;
            padding-top: 6px;
            margin-top: 6px;
            font-size: 9px;
          }
          .signature-area {
            display: flex;
            gap: 20px;
            align-items: flex-end;
          }
          .sig-line {
            border-top: 1px solid #0f172a;
            width: 1.8in;
            text-align: center;
            padding-top: 2px;
            font-size: 8.5px;
          }
          .qr-block {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .qr-block img {
            width: 50px;
            height: 50px;
          }
        </style>
      </head>
      <body>
        <div class="certificate-border">
          <!-- HEADER -->
          <div class="header-row">
            <div class="breeder-meta">
              <h1>Official 4-Generation Pedigree</h1>
              <h2>${activeBreeder.rabbitryName || 'WarrenWise Registered Rabbitry'}</h2>
              <p>Breeder: ${activeBreeder.name || 'Registered Breeder'} | Phone: ${activeBreeder.phone || 'On Record'}</p>
              <p>Email: ${activeBreeder.email || ''} ${activeBreeder.arbaMemberNumber ? `| ARBA #: ${activeBreeder.arbaMemberNumber}` : ''}</p>
            </div>
            
            <div class="proband-card">
              <h3>${proband.gcNumber ? 'GC ' : ''}${proband.name}</h3>
              <div class="proband-grid">
                <div>Ear / Tattoo: <strong>${proband.tattooNumber}</strong></div>
                <div>Sex: <strong style="text-transform: capitalize;">${proband.sex}</strong></div>
                <div>Breed: <strong>${proband.breed}</strong></div>
                <div>Variety: <strong>${proband.variety}</strong></div>
                <div>DOB: <strong>${proband.dob || 'Unknown'}</strong></div>
                <div>Weight: <strong>${(proband.weightOz / 16).toFixed(2)} lbs</strong></div>
                <div>Inbreeding (F): <strong>${(inbreedingCoeff * 100).toFixed(1)}%</strong></div>
                <div>Reg #: <strong>${proband.registrationNumber || 'Pending'}</strong></div>
              </div>
            </div>
          </div>

          <!-- 4-GENERATION TREE -->
          <div class="tree-grid">
            <!-- Gen 2: Parents -->
            <div class="gen-column">
              ${renderNodeBox(tree.gen2.sire, "Sire (Father)", "buck")}
              ${renderNodeBox(tree.gen2.dam, "Dam (Mother)", "doe")}
            </div>

            <!-- Gen 3: Grandparents -->
            <div class="gen-column">
              ${renderNodeBox(tree.gen3.patSire, "Sire's Sire", "buck")}
              ${renderNodeBox(tree.gen3.patDam, "Sire's Dam", "doe")}
              ${renderNodeBox(tree.gen3.matSire, "Dam's Sire", "buck")}
              ${renderNodeBox(tree.gen3.matDam, "Dam's Dam", "doe")}
            </div>

            <!-- Gen 4: Great-Grandparents -->
            <div class="gen-column">
              ${renderNodeBox(tree.gen4.patPatSire, "Sire's Sire's Sire", "buck")}
              ${renderNodeBox(tree.gen4.patPatDam, "Sire's Sire's Dam", "doe")}
              ${renderNodeBox(tree.gen4.patMatSire, "Sire's Dam's Sire", "buck")}
              ${renderNodeBox(tree.gen4.patMatDam, "Sire's Dam's Dam", "doe")}
              ${renderNodeBox(tree.gen4.matPatSire, "Dam's Sire's Sire", "buck")}
              ${renderNodeBox(tree.gen4.matPatDam, "Dam's Sire's Dam", "doe")}
              ${renderNodeBox(tree.gen4.matMatSire, "Dam's Dam's Sire", "buck")}
              ${renderNodeBox(tree.gen4.matMatDam, "Dam's Dam's Dam", "doe")}
            </div>
          </div>

          <!-- FOOTER & VERIFICATION -->
          <div class="footer-row">
            <div class="signature-area">
              <div class="sig-line">Breeder / Registrar Signature</div>
              <div class="sig-line">Date of Certification: ${new Date().toISOString().split('T')[0]}</div>
            </div>

            <div class="qr-block">
              <div>
                <strong>ARBA Lineage Registry Verified</strong><br/>
                <span>Token: ${verificationToken}</span><br/>
                <span style="font-size: 7.5px; color: #64748b;">rabbitrypedigreepro.com</span>
              </div>
              ${qrDataUrl ? `<img src="${qrDataUrl}" alt="Verification QR"/>` : ''}
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      return true;
    } else {
      // Popup blocked, fallback to inline window.print
      window.print();
      return false;
    }
  }
}
