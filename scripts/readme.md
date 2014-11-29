Scripts
=================

Scripts til at vedligeholde data i metadata-modulet


Konfigurationsfil
----------------------
Der er lavet en config-template.json konfigurationsfil.

Hvis man kopierer den over i en config.json fil og tilretter værdierne, vil nedenstående scripts benytte sig af hostname, username og password fra denne fil.

Det er praktisk, da den samtidig er tilføjet til .gitignore, så man ikke ved en fejl kommer til at committe den tilbage i source control.



initial_import.js
----------------------
Skal bruges som til den indledende import af data.

Tager som input et xlsx dokument.

Vær opmærksom på at kolonneoverskrifterne skal svare til felterne i skemaet -- store og små bogstaver har betydning



export.js
----------------------
Eksporterer databasen til excel.

Alle entries medtager deres dokument- og versions-id.

import.js
----------------------
Importerer eksporteret data tilbage i databasen.

Kan KUN bruges hvis

 1. xlsx filer genereret med export.js
 2. entries der forsøges importeret ikke er blevet opdateret andetsteds i mellemtiden.


 
