metadatabase
============

Metadata-modul til geodata
##Installation
Download zip filen eller klon biblioteket med git:

    git clone https://github.com/kosgis/metadatabase.git

Installer CouchDB, ElasticSearch og Curl
###Curl
Curl er en kommandolinie program til at kommunikere via http kommandoer. Det bruges til at starte replikering af CouchDB og ElasticSearch.
Download her: http://curl.haxx.se/dlwiz/?type=bin

###CouchDB
Kan installeres i Windows / Mac ved at hente zip fil fra hjemmesiden:
http://couchdb.apache.org

Kan installeres i Ubuntu ved at følge installationsvejledning her:
https://github.com/apache/couchdb

###ElasticSearch
Kræver Java JDK
http://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html
Husk ved Windows installation at sætte JAVA_HOME variabel.

![Alt text](/billeder/elasticsearch.png)

Hentes fra hjemmesiden:
http://www.elasticsearch.org

Udpak og kør bin/elasticsearch.bat
Test i browser http://localhost:9200

####Installer plugin til CouchDB
https://github.com/elasticsearch/elasticsearch-river-couchdb

    bin/plugin -install elasticsearch/elasticsearch-river-couchdb/1.2.0

####Opret index i ElasticSearch
```json
curl -XPOST localhost:9200/metadata_data/data/_mapping -d '{
  "data":{
    "properties":{
      "properties":{
	    "properties":{
          "titel" : {
            "type" : "multi_field",
            "fields" : {
              "titel" : {"type" : "string", "index" : "analyzed"},
              "untouched" : {"type" : "string", "index" : "not_analyzed"}
            }
          }
        }
      }
    }
  }
}'


safsdfsdf
asdfasdfsdf
