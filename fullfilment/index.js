/*
* HTTP Cloud Function.
*
* @param {Object} req Cloud Function request context.
* @param {Object} res Cloud Function response context.
*/
const http = require('http');
  exports.fullfilment = function fullfilment(req, res) {  
    if(req.body.result.metadata.intentId === '94661921-4785-4152-99c1-2ea8c8d157df'){
      meaningIntent()
      console.log('Meaning Called')
    }else if(req.body.result.metadata.intentId==='49d3ebdc-d6f0-48b2-bfdb-13bfe481ea45'){
      wordIntent()
      console.log('Words Called')
    }

  /*
  *
  *Function to send list words
  * 
  */
  function wordIntent(){
    const url = 'http://api.pearson.com/v2/dictionaries/ldoce5/entries?';
    let limit = req.body.result.parameters.number;
    let offset=Math.ceil(getOffset() +(limit/13254.168734624*400000*(Math.random()*10)));
    if(offset > 57965){
      offset - (limit/13254.168734624*400000*(Math.random()*10))
    }
    let offsetStr = `offset=${offset}&limit=${limit}`;
    getWords(offsetStr,url).then((out)=>{
      let html = makeHtml(out.results)
      res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
    res.send(JSON.stringify({
      "speech": html, "displayText": 'Html response'
    }));
    }).catch((err)=>{
      res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
    res.send(JSON.stringify({
      "speech": 'Some unexpected error occured, Please try after sometime', "displayText": 'Some unexpected error occured, Please try after sometime'
      //"speech" is the spoken version of the response, "displayText" is the visual version
    }));
    })
  }
  /*
  *
  *Function to create response from word list
  * 
  */
 function makeHtml(resarr){
  let html = `Here are your ${resarr.length} ${(resarr.length > 1)?'words':'word'}`
   resarr.forEach(res => {
    let word = res.headword
      let pos = (res.part_of_speech != '' && res.part_of_speech != undefined) ? res.part_of_speech : 'Not Available';
      let meaning = (res.senses[0].definition != '' && res.senses[0].definition != undefined) ? res.senses[0].definition[0] : 'Not Available';
      let exp = (res.senses[0].examples != '' && res.senses[0].examples != undefined) ? res.senses[0].examples[0].text : 'Not Available';

     let temp = `</div><div class='res'>
                  Word: ${word}
                  <br><br>
                  Part of Speech:${pos} 
                  <br><br>
                  Meaning: ${meaning}
                  <br><br>
                  Example: ${exp}
                `
     html = `${html}${temp}`
   });
   return html;
 }
  /*
  *
  *Function to send the meaning of a particular word
  * 
  */
  function meaningIntent(){
    const url = 'http://api.pearson.com/v2/dictionaries/ldoce5/entries?headword=';
  var mword = req.body.result.parameters.any;
  getMeaning(mword, url).then((out) => {
    if (out.results.length > 0) {
      let word = out.results[0].headword
      let speech = (out.results[0].part_of_speech != '' && out.results[0].part_of_speech != undefined) ? out.results[0].part_of_speech : 'Not Available';
      let definition = (out.results[0].senses[0].definition != '' && out.results[0].senses[0].definition != undefined) ? out.results[0].senses[0].definition[0] : 'Not Available';
      let example = (out.results[0].senses[0].examples != '' && out.results[0].senses[0].examples != undefined) ? out.results[0].senses[0].examples[0].text : 'Not Available';
      response = `
    speach tst
    `
      tresponse = `word: ${word}<br><br>
    Part of Speech: ${speech}<br><br>
    Meaning: ${definition}<br><br>
    Example: ${example}
    `;
    } else {
      response = `
        speach tst
      `
      tresponse = `
        Can't fine ${mword}. Please try any other word.
      `;
    }

    res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
    res.send(JSON.stringify({
      "speech": tresponse, "displayText": response
      //"speech" is the spoken version of the response, "displayText" is the visual version
    }));
  }).catch((err) => {
    res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
    res.send(JSON.stringify({
      "speech": 'Some unexpected error occured, Please try after sometime', "displayText": 'Some unexpected error occured, Please try after sometime'
      //"speech" is the spoken version of the response, "displayText" is the visual version
    }));
  })
  }

  /*
  *
  *Function to get the meaning of a particular word from API
  * 
  */
  function getMeaning(word, url) {
    return new Promise((resolve, reject) => {
      let path = url + word;
      http.get(path, (res) => {
        let body = ''; // var to store the response chunks
        res.on('data', (d) => { body += d; }); // store each response chunk
        res.on('end', () => {
          resolve(JSON.parse(body))
        })
        res.on('error', (err) => {
          reject(err)
        })
      });
    })
  }

  /*
  *
  *Function to get list of words from API
  * 
  */
 function getWords(offset, url) {
  return new Promise((resolve, reject) => {
    let path = url + offset;
    http.get(path, (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        resolve(JSON.parse(body))
      })
      res.on('error', (err) => {
        reject(err)
      })
    });
  })
}
  /*
  *
  *Function to get random offset
  * 
  */
    function getOffset(){
      if(Math.random()>0.5){
        return Math.random()*2300
      }else if(Math.random()*10<15){
        let rnd = getOffset();
        return Math.random()*100+rnd
      }else{
        let rnd = getOffset()+getOffset()
        return Math.random()*3400+rnd
      }
    }
};