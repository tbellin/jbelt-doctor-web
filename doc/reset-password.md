# reset password utente

## il ripristino della password è in due fasi:

- richiesta di nuova password fornendo la propria email
- ricezione di pagina con codice inviato dal server  form per chiedere la password con ripetizione 
per conferma dellesattezza

## la richiesta parte da una pagina 'accont/reset-password' dove si chiede di fornire la propria email.
POST /api/account/reset-password/init "string email"

## si deve ricevere un url che apre una pagina con un codice /account/reset/finish?key=blabla e
aprire una pagina che permetta di inserire la nuova password ripetuta per controllare l'esattezza

e inviare un POST /api/account/reset-password/finish {"key": "valore key ricevuta", "newPassword": "valore nuova password"}

