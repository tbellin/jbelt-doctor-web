<template>
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Genera Fattura Elettronica</h1>
  
      <!-- Dati Generali Fattura -->
      <section class="mb-6 p-4 border rounded-lg">
        <h2 class="text-xl font-semibold mb-3">Dati Generali</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="invoiceNumber" class="block text-sm font-medium text-gray-700">Numero Fattura</label>
            <input type="text" id="invoiceNumber" v-model="invoiceData.numero" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
          </div>
          <div>
            <label for="invoiceDate" class="block text-sm font-medium text-gray-700">Data Fattura</label>
            <input type="date" id="invoiceDate" v-model="invoiceData.data" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
          </div>
          <div>
            <label for="tipoDocumento" class="block text-sm font-medium text-gray-700">Tipo Documento (es. TD01)</label>
            <input type="text" id="tipoDocumento" v-model="invoiceData.tipoDocumento" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
          </div>
          <div>
            <label for="divisa" class="block text-sm font-medium text-gray-700">Divisa (es. EUR)</label>
            <input type="text" id="divisa" v-model="invoiceData.divisa" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
          </div>
        </div>
      </section>
  
      <!-- Dati Cedente Prestatore (Semplificati) -->
      <section class="mb-6 p-4 border rounded-lg">
        <h2 class="text-xl font-semibold mb-3">Cedente / Prestatore (Chi emette la fattura)</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="cedenteDenominazione" class="block text-sm font-medium text-gray-700">Denominazione</label>
            <input type="text" v-model="invoiceData.cedente.denominazione" id="cedenteDenominazione" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
          </div>
          <div>
            <label for="cedentePIVA" class="block text-sm font-medium text-gray-700">Partita IVA</label>
            <input type="text" v-model="invoiceData.cedente.pIva" id="cedentePIVA" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
          </div>
          <div>
            <label for="cedenteCodiceFiscale" class="block text-sm font-medium text-gray-700">Codice Fiscale</label>
            <input type="text" v-model="invoiceData.cedente.codiceFiscale" id="cedenteCodiceFiscale" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
          </div>
          <div>
            <label for="cedenteRegimeFiscale" class="block text-sm font-medium text-gray-700">Regime Fiscale (es. RF01)</label>
            <input type="text" v-model="invoiceData.cedente.regimeFiscale" id="cedenteRegimeFiscale" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
          </div>
        </div>
      </section>
  
      <!-- Dati Cessionario Committente (Semplificati) -->
      <section class="mb-6 p-4 border rounded-lg">
        <h2 class="text-xl font-semibold mb-3">Cessionario / Committente (Cliente)</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="cessionarioDenominazione" class="block text-sm font-medium text-gray-700">Denominazione</label>
            <input type="text" v-model="invoiceData.cessionario.denominazione" id="cessionarioDenominazione" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
          </div>
          <div>
            <label for="cessionarioPIVA" class="block text-sm font-medium text-gray-700">Partita IVA (se presente)</label>
            <input type="text" v-model="invoiceData.cessionario.pIva" id="cessionarioPIVA" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
          </div>
          <div>
            <label for="cessionarioCodiceFiscale" class="block text-sm font-medium text-gray-700">Codice Fiscale (se PIVA assente)</label>
            <input type="text" v-model="invoiceData.cessionario.codiceFiscale" id="cessionarioCodiceFiscale" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
          </div>
           <div>
            <label for="cessionarioCodiceDestinatario" class="block text-sm font-medium text-gray-700">Codice Destinatario (SDI)</label>
            <input type="text" v-model="invoiceData.cessionario.codiceDestinatario" id="cessionarioCodiceDestinatario" placeholder="XXXXXXX o 0000000 per PEC" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
          </div>
          <div>
            <label for="cessionarioPec" class="block text-sm font-medium text-gray-700">PEC (se Codice Dest. 0000000)</label>
            <input type="email" v-model="invoiceData.cessionario.pec" id="cessionarioPec" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
          </div>
        </div>
      </section>
  
      <!-- Righe Fattura -->
      <section class="mb-6 p-4 border rounded-lg">
        <h2 class="text-xl font-semibold mb-3">Dettaglio Righe</h2>
        <div v-for="(line, index) in invoiceData.lines" :key="index" class="mb-4 p-3 border rounded-md relative">
          <button @click="removeLine(index)" class="absolute top-2 right-2 text-red-500 hover:text-red-700">
            ×
          </button>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div class="md:col-span-2">
              <label :for="'desc-' + index" class="block text-sm font-medium text-gray-700">Descrizione</label>
              <input type="text" :id="'desc-' + index" v-model="line.descrizione" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
            </div>
            <div>
              <label :for="'qty-' + index" class="block text-sm font-medium text-gray-700">Quantità</label>
              <input type="number" :id="'qty-' + index" v-model.number="line.quantita" @input="calculateLineTotal(line)" min="0" step="any" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
            </div>
            <div>
              <label :for="'unitPrice-' + index" class="block text-sm font-medium text-gray-700">Prezzo Unit.</label>
              <input type="number" :id="'unitPrice-' + index" v-model.number="line.prezzoUnitario" @input="calculateLineTotal(line)" min="0" step="any" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
            </div>
            <div>
              <label :for="'vat-' + index" class="block text-sm font-medium text-gray-700">Aliquota IVA (%)</label>
              <input type="number" :id="'vat-' + index" v-model.number="line.aliquotaIVA" @input="calculateLineTotal(line)" min="0" step="any" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">
            Prezzo Totale (Riga): {{ formatCurrency(line.prezzoTotale) }}
          </div>
        </div>
        <button @click="addLine" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Aggiungi Riga
        </button>
      </section>
  
      <!-- Riepilogo e Totali -->
      <section class="mb-6 p-4 border rounded-lg">
        <h2 class="text-xl font-semibold mb-3">Riepilogo</h2>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span>Imponibile Totale:</span>
            <span class="font-semibold">{{ formatCurrency(totals.imponibile) }}</span>
          </div>
          <div v-for="(vatSummary, aliquota) in totals.riepilogoIVA" :key="aliquota" class="flex justify-between">
            <span>IVA {{ aliquota }}%:</span>
            <span class="font-semibold">{{ formatCurrency(vatSummary.imposta) }}</span>
          </div>
          <div class="flex justify-between text-lg font-bold border-t pt-2 mt-2">
            <span>TOTALE FATTURA:</span>
            <span>{{ formatCurrency(totals.totaleFattura) }}</span>
          </div>
        </div>
      </section>
  
      <!-- Azioni -->
      <section class="mt-8 flex space-x-4">
        <button @click="generateXML" class="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600">
          Genera XML FatturaPA
        </button>
        <button @click="generatePDF" class="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600">
          Genera PDF
        </button>
      </section>
  
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue';
  // import { create } from 'xmlbuilder2';
  // import jsPDF from 'jspdf';
  // import 'jspdf-autotable'; // Importa l'estensione autotable
  
  // Interfacce per i dati (semplificate)
  interface InvoiceLine {
    numeroLinea: number;
    descrizione: string;
    quantita: number;
    prezzoUnitario: number;
    aliquotaIVA: number;
    prezzoTotale: number; // calcolato: quantita * prezzoUnitario
    imponibile: number; // calcolato: prezzoTotale
    imposta: number; // calcolata: prezzoTotale * (aliquotaIVA / 100)
  }
  
  interface Party {
    denominazione: string;
    pIva?: string;
    codiceFiscale?: string;
    regimeFiscale?: string; // Solo per Cedente
    codiceDestinatario?: string; // Solo per Cessionario
    pec?: string; // Solo per Cessionario
    // Aggiungere indirizzo, CAP, comune, provincia, nazione etc. per XML completo
  }
  
  interface InvoiceData {
    numero: string;
    data: string; // YYYY-MM-DD
    tipoDocumento: string; // Es: TD01 per fattura
    divisa: string; // Es: EUR
    cedente: Party;
    cessionario: Party;
    lines: InvoiceLine[];
    // Campi aggiuntivi per FatturaPA: DatiTrasmissione, DatiBollo, DatiCassaPrevidenziale, etc.
    progressivoInvio: string; // Esempio, andrebbe generato univocamente
  }
  
  const defaultLine = (): Omit<InvoiceLine, 'numeroLinea'> => ({
    descrizione: '',
    quantita: 1,
    prezzoUnitario: 0,
    aliquotaIVA: 22,
    prezzoTotale: 0,
    imponibile: 0,
    imposta: 0,
  });
  
  const invoiceData = reactive<InvoiceData>({
    numero: 'FATT-001',
    data: new Date().toISOString().split('T')[0],
    tipoDocumento: 'TD01',
    divisa: 'EUR',
    cedente: {
      denominazione: 'MIA AZIENDA SRL',
      pIva: 'IT12345670123',
      codiceFiscale: '12345670123',
      regimeFiscale: 'RF01' // Ordinario
    },
    cessionario: {
      denominazione: 'CLIENTE SPA',
      pIva: 'IT98765430987',
      codiceDestinatario: '0000000' // In caso di PEC o codice destinatario errato/non trovato
      // pec: 'cliente@pec.it' // Se codiceDestinatario è 0000000
    },
    lines: [
      { numeroLinea: 1, ...defaultLine(), descrizione: 'Prodotto/Servizio di Esempio', prezzoUnitario: 100, aliquotaIVA: 22 },
    ],
    progressivoInvio: 'INV001' // Esempio, da rendere univoco e alfanumerico max 10 caratteri
  });
  
  // Calcola il totale per una singola riga
  const calculateLineTotal = (line: InvoiceLine) => {
    line.prezzoTotale = line.quantita * line.prezzoUnitario;
    line.imponibile = line.prezzoTotale; // Per semplicità, in FatturaPA è più complesso con sconti/maggiorazioni
    line.imposta = line.prezzoTotale * (line.aliquotaIVA / 100);
  };
  
  // Calcola i totali della fattura (imponibile, IVA per aliquota, totale fattura)
  const totals = computed(() => {
    let imponibileTotale = 0;
    const riepilogoIVA: Record<number, { imponibile: number, imposta: number }> = {};
    let totaleFattura = 0;
  
    invoiceData.lines.forEach(line => {
      calculateLineTotal(line); // Assicurati che i calcoli di riga siano aggiornati
      imponibileTotale += line.imponibile;
  
      if (!riepilogoIVA[line.aliquotaIVA]) {
        riepilogoIVA[line.aliquotaIVA] = { imponibile: 0, imposta: 0 };
      }
      riepilogoIVA[line.aliquotaIVA].imponibile += line.imponibile;
      riepilogoIVA[line.aliquotaIVA].imposta += line.imposta;
  
      totaleFattura += line.imponibile + line.imposta;
    });
  
    return {
      imponibile: imponibileTotale,
      riepilogoIVA,
      totaleFattura
    };
  });
  
  // Aggiunge una nuova riga
  const addLine = () => {
    invoiceData.lines.push({
      numeroLinea: invoiceData.lines.length + 1,
      ...defaultLine()
    });
  };
  
  // Rimuove una riga
  const removeLine = (index: number) => {
    invoiceData.lines.splice(index, 1);
    // Aggiorna i numeri di linea successivi
    for (let i = index; i < invoiceData.lines.length; i++) {
      invoiceData.lines[i].numeroLinea = i + 1;
    }
  };
  
  // Formattazione valuta
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: invoiceData.divisa }).format(value);
  };
  
  // Recalculate lines when one is removed or data changes
  watch(invoiceData.lines, (newLines) => {
    newLines.forEach((line, index) => {
      line.numeroLinea = index + 1;
      calculateLineTotal(line);
    });
  }, { deep: true });
  
  // Esegui il calcolo iniziale per le righe predefinite
  invoiceData.lines.forEach(calculateLineTotal);
  
  
  const generateXML = () => {
    // Validazione base (molto semplificata)
    if (!invoiceData.cedente.pIva || !invoiceData.cessionario.codiceDestinatario) {
      alert("Partita IVA Cedente e Codice Destinatario Cessionario sono obbligatori!");
      return;
    }
    if (invoiceData.cessionario.codiceDestinatario === '0000000' && !invoiceData.cessionario.pec) {
        alert("Se il Codice Destinatario è '0000000', la PEC del Cessionario è obbligatoria!");
        return;
    }
  
  
    // Costruzione dell'XML - ESEMPIO MOLTO SEMPLIFICATO!
    // La struttura reale è molto più complessa e richiede tutti i campi obbligatori e opzionali.
    // Consultare la documentazione ufficiale dell'Agenzia delle Entrate per lo schema FatturaPA.
  
    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('p:FatturaElettronica', {
        'xmlns:p': 'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2',
        'versione': 'FPR12' // O FPA12 per PA
      })
        .ele('FatturaElettronicaHeader')
          .ele('DatiTrasmissione')
            .ele('IdTrasmittente') // Identificativo univoco del soggetto che trasmette
              .ele('IdPaese').txt('IT').up()
              .ele('IdCodice').txt(invoiceData.cedente.pIva || invoiceData.cedente.codiceFiscale!).up() // PIVA o CF del trasmittente
            .up()
            .ele('ProgressivoInvio').txt(invoiceData.progressivoInvio).up() // Univoco per ogni file trasmesso
            .ele('FormatoTrasmissione').txt('FPR12').up() // O FPA12 per PA
            .ele('CodiceDestinatario').txt(invoiceData.cessionario.codiceDestinatario!).up() // Codice SDI del destinatario
            .ele('PECDestinatario').txt(invoiceData.cessionario.pec || '').up() // Opzionale se c'è CodiceDestinatario, obbligatorio se CodiceDestinatario è 0000000
          .up()
          .ele('CedentePrestatore')
            .ele('DatiAnagrafici')
              .ele('IdFiscaleIVA')
                .ele('IdPaese').txt('IT').up()
                .ele('IdCodice').txt(invoiceData.cedente.pIva!).up()
              .up()
              .ele('CodiceFiscale').txt(invoiceData.cedente.codiceFiscale || invoiceData.cedente.pIva!).up()
              .ele('Anagrafica')
                .ele('Denominazione').txt(invoiceData.cedente.denominazione).up()
              .up()
              .ele('RegimeFiscale').txt(invoiceData.cedente.regimeFiscale!).up()
            .up()
            .ele('Sede') // Campi obbligatori Indirizzo, CAP, Comune, Nazione
              .ele('Indirizzo').txt('Via Roma 1').up() // Esempio, da inserire nel form
              .ele('CAP').txt('00100').up()
              .ele('Comune').txt('Roma').up()
              .ele('Nazione').txt('IT').up()
            .up()
          .up()
          .ele('CessionarioCommittente')
            .ele('DatiAnagrafici')
              // Se PIVA presente, IdFiscaleIVA è obbligatorio. Altrimenti CodiceFiscale.
              .ele('IdFiscaleIVA', invoiceData.cessionario.pIva ? {} : undefined)
                ?.ele('IdPaese').txt('IT').up()
                ?.ele('IdCodice').txt(invoiceData.cessionario.pIva!).up()
              .up()
              .ele('CodiceFiscale', invoiceData.cessionario.codiceFiscale ? {} : undefined)
                ?.txt(invoiceData.cessionario.codiceFiscale!).up()
              .ele('Anagrafica')
                .ele('Denominazione').txt(invoiceData.cessionario.denominazione).up()
              .up()
            .up()
            .ele('Sede') // Campi obbligatori Indirizzo, CAP, Comune, Nazione
              .ele('Indirizzo').txt('Via Milano 2').up() // Esempio
              .ele('CAP').txt('20100').up()
              .ele('Comune').txt('Milano').up()
              .ele('Nazione').txt('IT').up()
            .up()
          .up()
        .up() // Fine FatturaElettronicaHeader
        .ele('FatturaElettronicaBody')
          .ele('DatiGenerali')
            .ele('DatiGeneraliDocumento')
              .ele('TipoDocumento').txt(invoiceData.tipoDocumento).up()
              .ele('Divisa').txt(invoiceData.divisa).up()
              .ele('Data').txt(invoiceData.data).up() // Formato YYYY-MM-DD
              .ele('Numero').txt(invoiceData.numero).up()
              // Aggiungere DatiRitenuta, DatiBollo, DatiCassaPrevidenziale, ScontoMaggiorazione etc. se necessari
              .ele('ImportoTotaleDocumento').txt(totals.value.totaleFattura.toFixed(2)).up()
              // Arrotondamento, Art73 etc.
            .up()
          .up()
          .ele('DatiBeniServizi')
            // DettaglioLinee
            invoiceData.lines.forEach(line => {
              root.first().last().last() // Raggiunge DatiBeniServizi
              .ele('DettaglioLinee')
                .ele('NumeroLinea').txt(line.numeroLinea.toString()).up()
                .ele('Descrizione').txt(line.descrizione).up()
                .ele('Quantita').txt(line.quantita.toFixed(2)).up() // Formattare a 2 decimali se necessario
                .ele('PrezzoUnitario').txt(line.prezzoUnitario.toFixed(2)).up()
                .ele('PrezzoTotale').txt(line.prezzoTotale.toFixed(2)).up()
                .ele('AliquotaIVA').txt(line.aliquotaIVA.toFixed(2)).up()
              .up()
            })
            // DatiRiepilogo
            Object.entries(totals.value.riepilogoIVA).forEach(([aliquota, summary]) => {
              root.first().last().last() // Raggiunge DatiBeniServizi
              .ele('DatiRiepilogo')
                .ele('AliquotaIVA').txt(parseFloat(aliquota).toFixed(2)).up()
                .ele('ImponibileImporto').txt(summary.imponibile.toFixed(2)).up()
                .ele('Imposta').txt(summary.imposta.toFixed(2)).up()
                .ele('EsigibilitaIVA').txt('I').up() // I = Immediata, D = Differita, S = Scissione Pagamenti (Split Payment)
              .up()
            })
          .up() // Fine DatiBeniServizi
        .up(); // Fine FatturaElettronicaBody
  
    const xmlString = root.end({ prettyPrint: true });
  
    // Download XML
    const blob = new Blob([xmlString], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    // Nome file suggerito IT + PIVA Cedente + _ + ProgressivoInvio + .xml
    const fileNameBase = `IT${invoiceData.cedente.pIva || invoiceData.cedente.codiceFiscale}${invoiceData.progressivoInvio}`;
    link.download = `${fileNameBase}.xml`; // Esempio: IT12345670123_INV001.xml
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  
    console.log(xmlString);
    alert('XML generato (vedi console e download). ATTENZIONE: Questo XML è una semplificazione e potrebbe non essere valido per l\'AdE.');
  };
  
  
  const generatePDF = () => {
    const doc = new jsPDF();
  
    // Font size e margini
    const fontSize = 10;
    const margin = 15;
    let yPos = margin;
  
    doc.setFontSize(16);
    doc.text(`Fattura N. ${invoiceData.numero} del ${invoiceData.data}`, margin, yPos);
    yPos += 10;
  
    doc.setFontSize(fontSize);
    doc.text(`Divisa: ${invoiceData.divisa}`, margin, yPos);
    yPos += 7;
  
    // Cedente
    doc.setFontSize(12);
    doc.text("Cedente/Prestatore:", margin, yPos);
    yPos += 6;
    doc.setFontSize(fontSize);
    doc.text(invoiceData.cedente.denominazione, margin, yPos);
    yPos += 5;
    doc.text(`P.IVA: ${invoiceData.cedente.pIva || 'N/D'} - C.F.: ${invoiceData.cedente.codiceFiscale || 'N/D'}`, margin, yPos);
    yPos += 5;
    doc.text(`Regime Fiscale: ${invoiceData.cedente.regimeFiscale || 'N/D'}`, margin, yPos);
    yPos += 10;
  
    // Cessionario
    doc.setFontSize(12);
    doc.text("Cessionario/Committente:", margin, yPos);
    yPos += 6;
    doc.setFontSize(fontSize);
    doc.text(invoiceData.cessionario.denominazione, margin, yPos);
    yPos += 5;
    doc.text(`P.IVA: ${invoiceData.cessionario.pIva || 'N/D'} - C.F.: ${invoiceData.cessionario.codiceFiscale || 'N/D'}`, margin, yPos);
    yPos += 5;
    doc.text(`Codice Destinatario: ${invoiceData.cessionario.codiceDestinatario || 'N/D'}`, margin, yPos);
     if(invoiceData.cessionario.pec) {
      yPos += 5;
      doc.text(`PEC: ${invoiceData.cessionario.pec}`, margin, yPos);
    }
    yPos += 10;
  
    // Tabella Righe Fattura
    const tableColumn = ["#", "Descrizione", "Qtà", "Prezzo Unit.", "IVA %", "Prezzo Tot."];
    const tableRows: (string|number)[][] = [];
  
    invoiceData.lines.forEach(line => {
      const lineData = [
        line.numeroLinea,
        line.descrizione,
        line.quantita.toFixed(2),
        formatCurrency(line.prezzoUnitario),
        line.aliquotaIVA.toFixed(2) + '%',
        formatCurrency(line.prezzoTotale)
      ];
      tableRows.push(lineData);
    });
  
    (doc as any).autoTable({ // Tipizzazione 'any' per autoTable se dà problemi
      head: [tableColumn],
      body: tableRows,
      startY: yPos,
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10 }, // #
        1: { cellWidth: 'auto' }, // Descrizione
        2: { cellWidth: 15, halign: 'right' }, // Qtà
        3: { cellWidth: 25, halign: 'right' }, // Prezzo Unit.
        4: { cellWidth: 15, halign: 'right' }, // IVA %
        5: { cellWidth: 25, halign: 'right' }, // Prezzo Tot.
      }
    });
  
    yPos = (doc as any).lastAutoTable.finalY + 10; // Posizione dopo la tabella
  
    // Totali
    doc.setFontSize(fontSize);
    doc.text(`Imponibile Totale: ${formatCurrency(totals.value.imponibile)}`, margin, yPos);
    yPos += 6;
  
    Object.entries(totals.value.riepilogoIVA).forEach(([aliquota, summary]) => {
      doc.text(`Totale IVA ${aliquota}% (su ${formatCurrency(summary.imponibile)}): ${formatCurrency(summary.imposta)}`, margin, yPos);
      yPos += 6;
    });
  
    yPos += 4; // Spazio prima del totale finale
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTALE FATTURA: ${formatCurrency(totals.value.totaleFattura)}`, margin, yPos);
    doc.setFont(undefined, 'normal');
  
  
    // Download PDF
    const fileName = `Fattura_${invoiceData.numero}_${invoiceData.data}.pdf`;
    doc.save(fileName);
  };
  
  </script>
  
  <style scoped>
  /* Puoi aggiungere stili specifici qui se non usi Tailwind o vuoi sovrascrivere qualcosa */
  /* Esempio per pulsante rimozione riga (già inline con Tailwind, ma come esempio) */
  /* .remove-line-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    color: red;
    cursor: pointer;
  } */
  </style>