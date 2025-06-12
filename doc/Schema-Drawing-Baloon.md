# definizione dello schema Drawing Sheet Model Baloon Note Attribute

Ho una struttura JDL che determina un server con definite le API.
mi trovo ad avere un Disegno ( Model -> ModelType Drawing ) che contiene n Fogli ( Sheet ) 
questi fogli hanno diverse Parti ( ModelType PART / ASSMBLY ) e Simboli (. Baloon )
Ogni Baloon si riferisce ad una Entità  del disegno ( Note ) che si definisce grazie a 4 AttributeEntity

il programma che ho costruito in Creo mi permette di posizionare un simbolo Bolla e tocco una entità di disegno. Ora una volta posizionato il simbolo io so tutto :
Disegno, Foglio, Modello ( PART / ASSEMBLY ), Simbolo, Entità e suoi Parametri.
Ho bisogno tramite API di memorizzare queste informazioni.
Dammi un programma Java ( No MultiThread ) che gestisca le funzioni di Save / Edit / Search 
