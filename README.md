metadatabase
============

Metadata-modul til geodata

Installer CouchDB, ElasticSearch, Curl og CouchApp
###CouchApp
Installer fra http://couchapp.org/page/installing
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

####Konfiguration af ElasticSearch
Opret index og mapping
```json
curl -X POST http://localhost:9200/metadata_data/data/_mapping -d '{
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
````
Opret river
```json
curl -X PUT http://localhost:9200/_river/metadata_data/_meta -d '{ 
  "type" : "couchdb", 
  "couchdb" : { 
    "host" : "localhost",
    "port" : 5984,
    "db" : "metadata_data",
    "filter" : "app\/data" 
  },
  "index" : { 
    "index" : "metadata_data",
    "type" : "data",
    "bulk_size" : 100,
    "bulk_timeout" : "10ms" 
  }
}'
```
I windows skal alle " tegn erstattes med \"
####Test
http://localhost:9200/metadata_data/_search?pretty=true
##Installation
Start CouchDB web interface
http://localhost:5984/_utils/index.html

I højreside under tools, vælg replicator
Repliker to databaser fra:

http://54.246.116.17:5984/metadata_data

http://54.246.116.17:5984/metadata_app

til lokale databaser med tilsvarende navne.

Test løsningen på http://localhost:5984/metadata_app/_design/app/index.html

##Formular opsætning
http://localhost:5984/_utils/database.html?metadata_data/_design/app/_view/schema

Viser skemaer til defination af formularopsætning.

Tilret eksisterende "test 1" og "test required".
