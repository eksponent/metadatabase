// recreate elastic search
var rp = require('request-promise');
var Promise = require('bluebird');
var username = 'xxx'; //skriv eget
var password = 'xxx'; //skriv eget
var hostname= '127.0.0.1';
var dbname='metadata_data';

if(fs.existsSync('config.json')){
    var cfg = JSON.parse(fs.readFileSync('config.json',{encoding:'UTF-8'}));    
    username=cfg.username;
    password=cfg.password;
    hostname=cfg.hostname;
    dbname=cfg.dbname;
}

function del(path){
	var url = 'http://'+hostname+':9200/'+path;
	console.log('DELETE '+url);
	return rp.del(url);
}

function deleteRiver(){
	return del('_river/'+dbname+'');
}
function deleteMapping(){
	return del(''+dbname+'/data/_mapping');
}
function deleteIndex(){
	return del(''+dbname+'');
}



Promise.settle([deleteRiver(),deleteMapping(),deleteIndex()])
.then(function(results){
	console.log('settled');
	buildup();
})
.catch(function(err){
	console.error(err.statusCode);
});





function createIndex(){
	console.log('creating index');
	return 	rp.post('http://'+hostname+':9200/'+dbname+'');
}


function createRiver(){
	console.log('createRiver');
	var json={ 
	  "type" : "couchdb", 
	  "couchdb" : { 
	    "host" : "127.0.0.1",
	    "port" : 5984,
	    "db" : dbname,
	    "filter" : "app/data"
	  },
	  "index" : { 
	    "index" : dbname,
	    "type" : "data",
	    "bulk_size" : 100,
	    "bulk_timeout" : "10ms" 
	  }
	};
	var options={
		url:'http://'+hostname+':9200/_river/'+dbname+'/_meta',
		json: json
	}
	return rp.put(options);

}

function createMapping(){
	console.log('create Mapping')
	var json={
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
		};

	var options={
		url:'http://'+hostname+':9200/'+dbname+'/data/_mapping',
		json: json
	}
	return rp.put(options);

}



function buildup(){
	console.log('recreating');
createIndex().then(function(){
	Promise.settle([createMapping(),createRiver()])
	.then(function(results){
		results.forEach(function(result){
		     if(result.isFulfilled()){
		         console.log(result)
		     } else {
		     	console.log('ERROR');
		     	console.log(result);

		     }
		  });
	})
	.catch(function(err){console.log(err.statusCode);})
});}
