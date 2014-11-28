Scripts
--------------------

Scripts til at vedligeholde data i metadata-modulet


initial_import.js
====================
Skal bruges som til den indledende import af data.

Tager som input et xlsx dokument.

Vær opmærksom på at kolonneoverskrifterne skal svare til felterne i skemaet -- store og små bogstaver har betydning



export.js
=====================
Eksporterer databasen til excel.

Alle entries medtager deres dokument- og versions-id.

import.js
======================
Importerer eksporteret data tilbage i databasen.

Kan KUN bruges hvis

 1. xlsx filer genereret med export.js
 2. entries der forsøges importeret ikke er blevet opdateret andetsteds i mellemtiden.


 