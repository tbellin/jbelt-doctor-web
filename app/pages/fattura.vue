// File: /app/pages/fattura.vue
<template>
  <div class="container py-4">
    <h1>Genera Fattura Elettronica</h1>

    <form @submit.prevent="generaFattura">
      <div class="mb-3">
        <label for="piva-emittente" class="form-label">Partita IVA emittente:</label>
        <input 
          id="piva-emittente" 
          type="text" 
          v-model="fattura.emittente.pIva" 
          class="form-control" 
          required 
        />
      </div>

      <div class="mb-3">
        <label for="denominazione-emittente" class="form-label">Denominazione Emittente:</label>
        <input 
          id="denominazione-emittente" 
          type="text" 
          v-model="fattura.emittente.denominazione" 
          class="form-control" 
          required 
        />
      </div>

      <div class="mb-3">
        <label for="piva-cliente" class="form-label">Partita IVA cliente:</label>
        <input 
          id="piva-cliente" 
          type="text" 
          v-model="fattura.cliente.pIva" 
          class="form-control" 
          required 
        />
      </div>

      <div class="mb-3">
        <label for="denominazione-cliente" class="form-label">Denominazione Cliente:</label>
        <input 
          id="denominazione-cliente" 
          type="text" 
          v-model="fattura.cliente.denominazione" 
          class="form-control" 
          required 
        />
      </div>

      <div class="mb-3">
        <h3>Righe fattura</h3>
        <div v-for="(riga, index) in fattura.righe" :key="index" class="row mb-2">
          <div class="col-md-2">
            <input 
              type="text" 
              v-model="riga.codice" 
              class="form-control" 
              placeholder="Codice" 
              required 
            />
          </div>
          <div class="col-md-4">
            <input 
              type="text" 
              v-model="riga.descrizione" 
              class="form-control" 
              placeholder="Descrizione" 
              required 
            />
          </div>
          <div class="col-md-2">
            <input 
              type="number" 
              v-model.number="riga.importo" 
              class="form-control" 
              placeholder="Importo" 
              step="0.01" 
              min="0" 
              required 
            />
          </div>
          <div class="col-md-2">
            <input 
              type="number" 
              v-model.number="riga.iva" 
              class="form-control" 
              placeholder="IVA %" 
              step="0.1" 
              min="0" 
              required 
            />
          </div>
          <div class="col-md-2">
            <button 
              type="button" 
              @click="removeRiga(index)" 
              class="btn btn-danger w-100"
            >
              Elimina
            </button>
          </div>
        </div>
        <button 
          type="button" 
          @click="addRiga" 
          class="btn btn-secondary mt-2"
        >
          Aggiungi riga
        </button>
      </div>

      <button type="submit" class="btn btn-primary">Genera XML</button>
    </form>

    <div v-if="fattura.righe.length" class="mt-4">
      <h3>Righe inserite</h3>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Codice</th>
            <th>Descrizione</th>
            <th>Importo Netto</th>
            <th>IVA %</th>
            <th>Importo Totale</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(riga, index) in fattura.righe" :key="index">
            <td>{{ riga.codice }}</td>
            <td>{{ riga.descrizione }}</td>
            <td>{{ formattaValuta(riga.importo) }}</td>
            <td>{{ riga.iva }}%</td>
            <td>{{ formattaValuta(calcolaImportoConIva(riga)) }}</td>
          </tr>
          <tr>
            <td colspan="2"><strong>Totali</strong></td>
            <td><strong>{{ formattaValuta(totaleNetto) }}</strong></td>
            <td>-</td>
            <td><strong>{{ formattaValuta(totaleGenerale) }}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="xmlFattura" class="mt-4">
      <h3>XML Fattura Generata:</h3>
      <div class="bg-light p-3 rounded">
        <pre class="mb-0 overflow-auto">{{ xmlFattura }}</pre>
      </div>
      <div class="mt-2 d-flex gap-2 flex-wrap">
        <a 
          :href="xmlDownloadLink" 
          download="fattura.xml" 
          class="btn btn-success"
        >
          Scarica XML
        </a>
        <button 
          @click="generaPDF" 
          class="btn btn-danger"
        >
          Scarica PDF
        </button>
        <button 
          @click="generaExcel" 
          class="btn btn-primary"
        >
          Scarica Excel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface Riga {
  codice: string;
  descrizione: string;
  importo: number;
  iva: number;
}

interface Soggetto {
  pIva: string;
  denominazione: string;
}

interface FatturaData {
  emittente: Soggetto;
  cliente: Soggetto;
  righe: Riga[];
}

// Inizializzazione della struttura fattura
const fattura = ref<FatturaData>({
  emittente: { pIva: '', denominazione: '' },
  cliente: { pIva: '', denominazione: '' },
  righe: [],
});

const xmlFattura = ref<string>('');

// Riferimenti per le librerie esterne
const jsPDF = ref<any>(null);
const XLSX = ref<any>(null);

// Caricamento delle librerie esterne
onMounted(async () => {
  // Caricamento di jsPDF per la generazione del PDF
  if (!window.jspdf) {
    const jsPdfScript = document.createElement('script');
    jsPdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    jsPdfScript.async = true;
    jsPdfScript.onload = () => {
      jsPDF.value = window.jspdf.jsPDF;
    };
    document.head.appendChild(jsPdfScript);
  } else {
    jsPDF.value = window.jspdf.jsPDF;
  }

  // Caricamento di SheetJS per la generazione Excel
  if (!window.XLSX) {
    const xlsxScript = document.createElement('script');
    xlsxScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    xlsxScript.async = true;
    xlsxScript.onload = () => {
      XLSX.value = window.XLSX;
    };
    document.head.appendChild(xlsxScript);
  } else {
    XLSX.value = window.XLSX;
  }
});

// Funzioni di gestione righe
const addRiga = () => {
  fattura.value.righe.push({ 
    codice: '', 
    descrizione: '', 
    importo: 0, 
    iva: 22 
  });
};

const removeRiga = (index: number) => {
  fattura.value.righe.splice(index, 1);
};

// Funzioni di calcolo
const calcolaImportoConIva = (riga: Riga): number => {
  return riga.importo + (riga.importo * riga.iva / 100);
};

const formattaValuta = (valore: number): string => {
  return valore.toFixed(2);
};

// Computed properties per i totali
const totaleNetto = computed<number>(() => 
  fattura.value.righe.reduce((acc, riga) => acc + riga.importo, 0)
);

const totaleIVA = computed<number>(() => 
  fattura.value.righe.reduce((acc, riga) => acc + (riga.importo * riga.iva / 100), 0)
);

const totaleGenerale = computed<number>(() => 
  totaleNetto.value + totaleIVA.value
);

// Funzione principale di generazione fattura
const generaFattura = () => {
  const dataOdierna = new Date().toISOString().split('T')[0];
  
  const righeXML = fattura.value.righe.map((riga, idx) => `
    <DettaglioLinee>
      <NumeroLinea>${idx + 1}</NumeroLinea>
      <CodiceArticolo>
        <CodiceTipo>ARTICOLO</CodiceTipo>
        <CodiceValore>${riga.codice}</CodiceValore>
      </CodiceArticolo>
      <Descrizione>${riga.descrizione}</Descrizione>
      <Quantita>1.00</Quantita>
      <PrezzoUnitario>${formattaValuta(riga.importo)}</PrezzoUnitario>
      <PrezzoTotale>${formattaValuta(riga.importo)}</PrezzoTotale>
      <AliquotaIVA>${formattaValuta(riga.iva)}</AliquotaIVA>
    </DettaglioLinee>`).join('');

  // Creazione dei riepiloghi IVA raggruppati per aliquota
  const aliquoteIva = new Map<number, { imponibile: number, imposta: number }>();
  
  for (const riga of fattura.value.righe) {
    const valoreCorrente = aliquoteIva.get(riga.iva) || { imponibile: 0, imposta: 0 };
    const nuovoImponibile = valoreCorrente.imponibile + riga.importo;
    const nuovaImposta = nuovoImponibile * riga.iva / 100;
    
    aliquoteIva.set(riga.iva, { 
      imponibile: nuovoImponibile, 
      imposta: nuovaImposta 
    });
  }
  
  const riepilogoXML = Array.from(aliquoteIva.entries())
    .map(([aliquota, { imponibile, imposta }]) => `
    <DatiRiepilogo>
      <AliquotaIVA>${formattaValuta(aliquota)}</AliquotaIVA>
      <ImponibileImporto>${formattaValuta(imponibile)}</ImponibileImporto>
      <Imposta>${formattaValuta(imposta)}</Imposta>
      <EsigibilitaIVA>I</EsigibilitaIVA>
    </DatiRiepilogo>`).join('');

  xmlFattura.value = `<?xml version="1.0" encoding="UTF-8"?>
<FatturaElettronica versione="FPR12" xmlns="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente>
        <IdPaese>IT</IdPaese>
        <IdCodice>${fattura.value.emittente.pIva}</IdCodice>
      </IdTrasmittente>
      <ProgressivoInvio>00001</ProgressivoInvio>
      <FormatoTrasmissione>FPR12</FormatoTrasmissione>
      <CodiceDestinatario>0000000</CodiceDestinatario>
    </DatiTrasmissione>
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>IT</IdPaese>
          <IdCodice>${fattura.value.emittente.pIva}</IdCodice>
        </IdFiscaleIVA>
        <Anagrafica>
          <Denominazione>${fattura.value.emittente.denominazione}</Denominazione>
        </Anagrafica>
        <RegimeFiscale>RF01</RegimeFiscale>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>Via Example</Indirizzo>
        <CAP>00000</CAP>
        <Comune>Esempio</Comune>
        <Provincia>EX</Provincia>
        <Nazione>IT</Nazione>
      </Sede>
    </CedentePrestatore>
    <CessionarioCommittente>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>IT</IdPaese>
          <IdCodice>${fattura.value.cliente.pIva}</IdCodice>
        </IdFiscaleIVA>
        <Anagrafica>
          <Denominazione>${fattura.value.cliente.denominazione}</Denominazione>
        </Anagrafica>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>Via Cliente</Indirizzo>
        <CAP>00000</CAP>
        <Comune>Cliente</Comune>
        <Provincia>CL</Provincia>
        <Nazione>IT</Nazione>
      </Sede>
    </CessionarioCommittente>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>TD01</TipoDocumento>
        <Divisa>EUR</Divisa>
        <Data>${dataOdierna}</Data>
        <Numero>1</Numero>
        <ImportoTotaleDocumento>${formattaValuta(totaleGenerale.value)}</ImportoTotaleDocumento>
      </DatiGeneraliDocumento>
    </DatiGenerali>
    <DatiBeniServizi>
${righeXML}
${riepilogoXML}
    </DatiBeniServizi>
  </FatturaElettronicaBody>
</FatturaElettronica>`;
};

// Funzione per generare e scaricare il PDF
const generaPDF = () => {
  if (!jsPDF.value) {
    alert('Caricamento libreria PDF in corso, riprova tra qualche secondo.');
    return;
  }

  // Crea una nuova istanza di jsPDF
  const doc = new jsPDF.value();
  
  // Intestazione
  doc.setFontSize(18);
  doc.text('Fattura Elettronica', 105, 15, { align: 'center' });
  doc.setFontSize(12);
  
  // Dati emittente
  doc.setFontSize(14);
  doc.text('Dati Emittente', 14, 30);
  doc.setFontSize(10);
  doc.text(`P.IVA: ${fattura.value.emittente.pIva}`, 14, 38);
  doc.text(`Denominazione: ${fattura.value.emittente.denominazione}`, 14, 46);
  
  // Dati cliente
  doc.setFontSize(14);
  doc.text('Dati Cliente', 14, 60);
  doc.setFontSize(10);
  doc.text(`P.IVA: ${fattura.value.cliente.pIva}`, 14, 68);
  doc.text(`Denominazione: ${fattura.value.cliente.denominazione}`, 14, 76);
  
  // Tabella righe fattura
  if (fattura.value.righe.length > 0) {
    // Intestazione tabella
    doc.setFontSize(12);
    doc.text('Dettaglio Righe', 14, 95);
    doc.setFontSize(10);
    
    // Intestazioni colonne
    const headers = ['Codice', 'Descrizione', 'Importo', 'IVA %', 'Totale'];
    let yPos = 105;
    let xPos = 14;
    
    // Disegna intestazioni
    headers.forEach((header, i) => {
      const width = i === 1 ? 70 : 25; // Colonna descrizione più larga
      doc.text(header, xPos + (i > 0 ? (i === 1 ? 25 : i === 2 ? 95 : i === 3 ? 120 : 145) : 0), yPos);
      
      if (i < headers.length - 1) {
        xPos += width;
      }
    });
    
    // Linea orizzontale sotto le intestazioni
    doc.line(14, yPos + 2, 196, yPos + 2);
    yPos += 10;
    
    // Righe fattura
    fattura.value.righe.forEach((riga, index) => {
      xPos = 14;
      
      // Codice
      doc.text(riga.codice, xPos, yPos);
      xPos += 25;
      
      // Descrizione (tronca se troppo lunga)
      let desc = riga.descrizione;
      if (desc.length > 30) {
        desc = desc.substring(0, 27) + '...';
      }
      doc.text(desc, xPos, yPos);
      xPos += 70;
      
      // Importo
      doc.text(formattaValuta(riga.importo), xPos, yPos);
      xPos += 25;
      
      // IVA %
      doc.text(`${riga.iva}%`, xPos, yPos);
      xPos += 25;
      
      // Totale
      doc.text(formattaValuta(calcolaImportoConIva(riga)), xPos, yPos);
      
      // Incrementa posizione verticale per la prossima riga
      yPos += 8;
      
      // Se stiamo per sforare la pagina, crea una nuova pagina
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    // Linea orizzontale dopo le righe
    doc.line(14, yPos, 196, yPos);
    yPos += 10;
    
    // Totali
    doc.text('Totale Netto:', 130, yPos);
    doc.text(formattaValuta(totaleNetto.value), 170, yPos);
    yPos += 8;
    
    doc.text('Totale IVA:', 130, yPos);
    doc.text(formattaValuta(totaleIVA.value), 170, yPos);
    yPos += 8;
    
    doc.text('Totale Documento:', 130, yPos);
    doc.setFontSize(12);
    doc.text(formattaValuta(totaleGenerale.value), 170, yPos);
  }
  
  // Salva il PDF
  doc.save('fattura.pdf');
};

// Funzione per generare e scaricare il file Excel
const generaExcel = () => {
  if (!XLSX.value) {
    alert('Caricamento libreria Excel in corso, riprova tra qualche secondo.');
    return;
  }

  // Crea un nuovo workbook
  const wb = XLSX.value.utils.book_new();
  
  // Crea foglio con dati anagrafici
  const anagraficaData = [
    ['Fattura Elettronica', ''],
    ['', ''],
    ['Dati Emittente', ''],
    ['P.IVA', fattura.value.emittente.pIva],
    ['Denominazione', fattura.value.emittente.denominazione],
    ['', ''],
    ['Dati Cliente', ''],
    ['P.IVA', fattura.value.cliente.pIva],
    ['Denominazione', fattura.value.cliente.denominazione],
  ];
  
  const anagraficaSheet = XLSX.value.utils.aoa_to_sheet(anagraficaData);
  XLSX.value.utils.book_append_sheet(wb, anagraficaSheet, 'Anagrafica');
  
  // Crea foglio con righe fattura
  const righeData = [
    ['Codice', 'Descrizione', 'Importo Netto', 'IVA %', 'Importo Totale'],
  ];
  
  // Aggiungi le righe
  fattura.value.righe.forEach(riga => {
    righeData.push([
      riga.codice,
      riga.descrizione,
      parseFloat(formattaValuta(riga.importo)),
      riga.iva,
      parseFloat(formattaValuta(calcolaImportoConIva(riga)))
    ]);
  });
  
  // Aggiungi i totali
  righeData.push(['', '', '', '', '']);
  righeData.push(['Totale Netto', '', parseFloat(formattaValuta(totaleNetto.value)), '', '']);
  righeData.push(['Totale IVA', '', parseFloat(formattaValuta(totaleIVA.value)), '', '']);
  righeData.push(['Totale Documento', '', '', '', parseFloat(formattaValuta(totaleGenerale.value))]);
  
  const righeSheet = XLSX.value.utils.aoa_to_sheet(righeData);
  XLSX.value.utils.book_append_sheet(wb, righeSheet, 'Righe');
  
  // Salva il file Excel
  XLSX.value.writeFile(wb, 'fattura.xlsx');
};

// Computed per la generazione del link di download
const xmlDownloadLink = computed<string>(() => 
  `data:text/xml;charset=utf-8,${encodeURIComponent(xmlFattura.value)}`
);
</script>

<style scoped>
.container { 
  max-width: 900px;
  margin: 0 auto;
}

pre {
  max-height: 400px;
  white-space: pre-wrap;
  font-size: 0.85rem;
}
</style>