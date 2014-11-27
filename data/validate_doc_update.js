function (newDoc, oldDoc, userCtx) {   
return;// disable security
if (userCtx.roles.indexOf('_admin') !== -1 || userCtx.roles.indexOf('metadata') !== -1) {
		return;
	} else {  
                   if (!newDoc.properties.roles){
                      throw({forbidden: 'forbudt?'});
                   }  else  {  if (userCtx.roles.indexOf(newDoc.properties.roles) !== -1 ) {
		                          return;
	                        } else {
		                              throw({
		                                    	unauthorized:'Du skal være logget ind og autoriseret for at kunne gemme.'
		                                    });
	                          }
                            }    
			}
 			
 }
