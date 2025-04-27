Ecco le istruzioni in formato Markdown (.md) per eseguire il tuo setup Docker.

Markdown

# Istruzioni per l'Esecuzione dell'Applicazione Nuxt con Docker

Questa guida spiega come avviare l'applicazione Nuxt definita nei file `Dockerfile` e `docker-compose.yml`.

**Caratteristiche Principali di questo Setup:**

* Il codice dell'applicazione viene copiato nell'immagine Docker durante la fase di build (`COPY ./ .`).
* **Non** c'è un collegamento "live" (bind mount) con la cartella del codice sorgente sull'host.
* Le modifiche al codice sorgente richiederanno una nuova build dell'immagine per essere visibili.
* Utilizza un volume Docker nominato per persistere la cartella `node_modules`.
* Si connette a una rete Docker esterna preesistente chiamata `jbelt-network`.

## Prerequisiti

Prima di iniziare, assicurati di avere installato:

1.  **Docker Engine:** [Installa Docker](https://docs.docker.com/engine/install/)
2.  **Docker Compose:** Solitamente incluso con Docker Desktop (Windows/Mac). Per Linux, potrebbe essere necessario installarlo separatamente. [Installa Docker Compose](https://docs.docker.com/compose/install/)

## Struttura dei File

Assicurati che la struttura del tuo progetto sia la seguente (con `Dockerfile`, `docker-compose.yml` e i file sorgente di Nuxt tutti nella stessa directory principale):

.
├── Dockerfile           # Il Dockerfile per costruire l'immagine Nuxt
├── docker-compose.yml   # Il file Docker Compose per definire il servizio
├── package.json         # File delle dipendenze Node
├── nuxt.config.ts       # Configurazione di Nuxt
├── pages/               # Cartella delle pagine Nuxt
├── components/          # Cartella dei componenti Nuxt
└── ...                  # Tutti gli altri file e cartelle del progetto Nuxt


*(Nota: Questo differisce dall'esempio iniziale che usava una sottocartella `/app`. Ora si assume che tutto sia nella root, come indicato dalla correzione `COPY ./ .` nel Dockerfile).*

## Istruzioni Passo-Passo

Segui questi passaggi dal terminale, navigando prima nella directory principale del tuo progetto (dove si trovano `Dockerfile` e `docker-compose.yml`).

**1. Crea la Rete Docker (se non esiste)**

Il file `docker-compose.yml` è configurato per usare una rete esterna chiamata `jbelt-network`. Se questa rete non esiste già sul tuo sistema Docker, devi crearla manualmente. **Questo comando va eseguito solo una volta.**

```bash
docker network create jbelt-network
Se il comando restituisce un errore indicando che la rete esiste già, puoi ignorarlo e procedere.

2. Costruisci l'Immagine Docker e Avvia il Container

Questo comando leggerà il Dockerfile per costruire l'immagine (se non esiste o se forzi la build) e poi avvierà il container come definito in docker-compose.yml.

Bash

# Esegui questo comando dalla root del progetto
docker-compose up --build -d
up: Crea e avvia i container.
--build: Forza la ricostruzione dell'immagine Docker. Necessario la prima volta e ogni volta che modifichi il codice sorgente o il Dockerfile.
-d: Avvia i container in modalità "detached" (in background), lasciando libero il terminale.
Docker ora:

Costruirà l'immagine mia-nuxt-app-baked:latest (o il nome che hai specificato).
Avvierà un container chiamato mia-nuxt-app-baked-dev.
Utilizzerà il volume nominato nuxt4-node-modules-baked per /usr/src/app/node_modules.
Collegherà il container alla rete jbelt-network.
Mapperà la porta 3000 del container alla porta 3000 del tuo computer.
3. Accedi all'Applicazione

Apri il tuo browser web e vai a:

https://www.google.com/search?q=http://localhost:3000

Dovresti vedere la tua applicazione Nuxt in esecuzione.

4. Ferma l'Applicazione

Quando hai finito, puoi fermare e rimuovere i container definiti nel file docker-compose.yml con:

Bash

docker-compose down
Questo comando ferma e rimuove i container, ma non elimina il volume nominato (nuxt4-node-modules-baked) né la rete (jbelt-network).

5. Aggiorna l'Applicazione (dopo modifiche al codice)

Dato che non stai usando un bind mount per il codice sorgente, se modifichi i file della tua applicazione Nuxt (es. un componente, una pagina, nuxt.config.ts), devi ricostruire l'immagine Docker e riavviare il container per vedere le modifiche:

Bash

# Assicurati di essere nella directory del progetto
docker-compose up --build -d
Questo comando aggiornerà l'immagine con il nuovo codice e riavvierà il container.

Pulizia (Opzionale)
Se vuoi rimuovere completamente le risorse create (oltre ai container che vengono rimossi con docker-compose down):

Rimuovi il Volume Nominato: (Attenzione: questo elimina i node_modules cachati)

Bash

docker volume rm nuxt4-node-modules-baked
(Usa il nome del volume specificato nel tuo docker-compose.yml)

Rimuovi la Rete:

Bash

docker network rm jbelt-network
Risoluzione Problemi
Errore "Port is already allocated": Significa che un altro processo sta usando la porta 3000 sul tuo computer. Puoi fermare quel processo o cambiare la mappatura della porta in docker-compose.yml (es. "8080:3000" per accedere via http://localhost:8080).
Il container non parte o si ferma subito: Controlla i log del container per errori:
Bash

# Mostra i log del servizio 'nuxt_app' (usa il nome definito in docker-compose.yml)
docker-compose logs nuxt_app

# Segui i log in tempo reale
docker-compose logs -f nuxt_app
Assicurati che Docker sia in esecuzione: Verifica lo stato del Docker Daemon.
