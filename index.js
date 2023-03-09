const path = require( 'path' );
const {DBFFile} = require('dbffile');
const {wildcardRegExp} = require('wildcard-regex');
const express = require( 'express' );
const bonjour = require('bonjour')();


var config = require('d:\\auto-agro\\Skladnik-Rest\\conf'+'ig.json');

console.log(config);

async function testRead(kod) {
    const gugl = wildcardRegExp(kod.toUpperCase());
    let dbf = await DBFFile.open(config.karty,{encoding: 'win-1250'});
    console.log(`DBF file contains ${dbf.recordCount} records.`);
    let vystup=[];
    let records = await dbf.readRecords(dbf.recordCount);
    for (let r of records) {
	if (gugl.test(r.CMAT.toUpperCase())){
	  let p= r.PRIJEM01 + r.PRIJEM02+r.PRIJEM03+r.PRIJEM04+r.PRIJEM05+r.PRIJEM06+r.PRIJEM07+r.PRIJEM08+r.PRIJEM09+r.PRIJEM10+r.PRIJEM11+r.PRIJEM12;
	  let v= r.VYDAJ01 + r.VYDAJ02+r.VYDAJ03+r.VYDAJ04+r.VYDAJ05+r.VYDAJ06+r.VYDAJ07+r.VYDAJ08+r.VYDAJ09+r.VYDAJ10+r.VYDAJ11+r.VYDAJ12;
	  let rec = {nazov: r.NAZOV, cena_sklad: r.CENASKL, dph: r.DPH, nakup: r.CENA_N, uid: r.CMAT, cena_p1: r.CENA_P1, cena_p1sDPH: r.CENA_P1D, pociatok:r.POCSTAV, prijem: p, vydaj:v, stav:r.POCSTAV+p-v, minStav: r.MINSTAV, mj:r.MJ}
	  vystup.push(rec);
	}
    }
    let sortedProducts = vystup.sort(
       (p1, p2) => (p1.uid < p2.uid) ? 1 : (p1.uid > p2.uid) ? -1 : 0);
    return sortedProducts;
}

async function testRead2(kod,typ) {
    const gugl = wildcardRegExp(kod.toUpperCase());
    const gugl2 = wildcardRegExp('*'+kod.toUpperCase());
    let dbf = await DBFFile.open(config.karty,{encoding: 'win-1250'});
    console.log(`DBF file contains ${dbf.recordCount} records.`);
    let vystup=[];
    console.log('Manualne hladanie: '+kod.toUpperCase());
    let records = await dbf.readRecords(dbf.recordCount);
    for (let r of records) {
      if (typ=1)
	if (gugl.test(r.CMAT.toUpperCase())){
	  let p= r.PRIJEM01 + r.PRIJEM02+r.PRIJEM03+r.PRIJEM04+r.PRIJEM05+r.PRIJEM06+r.PRIJEM07+r.PRIJEM08+r.PRIJEM09+r.PRIJEM10+r.PRIJEM11+r.PRIJEM12;
	  let v= r.VYDAJ01 + r.VYDAJ02+r.VYDAJ03+r.VYDAJ04+r.VYDAJ05+r.VYDAJ06+r.VYDAJ07+r.VYDAJ08+r.VYDAJ09+r.VYDAJ10+r.VYDAJ11+r.VYDAJ12;
	  let rec = {nazov: r.NAZOV, cena_sklad: r.CENASKL, dph: r.DPH, nakup: r.CENA_N, uid: r.CMAT, cena_p1: r.CENA_P1, cena_p1sDPH: r.CENA_P1D, pociatok:r.POCSTAV, prijem: p, vydaj:v, stav:r.POCSTAV+p-v, minStav: r.MINSTAV, mj:r.MJ}
	  vystup.push(rec);
	}
      if (typ=2)
	if (gugl2.test(r.NAZOV.toUpperCase())){
	  let p= r.PRIJEM01 + r.PRIJEM02+r.PRIJEM03+r.PRIJEM04+r.PRIJEM05+r.PRIJEM06+r.PRIJEM07+r.PRIJEM08+r.PRIJEM09+r.PRIJEM10+r.PRIJEM11+r.PRIJEM12;
	  let v= r.VYDAJ01 + r.VYDAJ02+r.VYDAJ03+r.VYDAJ04+r.VYDAJ05+r.VYDAJ06+r.VYDAJ07+r.VYDAJ08+r.VYDAJ09+r.VYDAJ10+r.VYDAJ11+r.VYDAJ12;
	  let rec = {nazov: r.NAZOV, cena_sklad: r.CENASKL, dph: r.DPH, nakup: r.CENA_N, uid: r.CMAT, cena_p1: r.CENA_P1, cena_p1sDPH: r.CENA_P1D, pociatok:r.POCSTAV, prijem: p, vydaj:v, stav:r.POCSTAV+p-v, minStav: r.MINSTAV, mj:r.MJ}
	  vystup.push(rec);
	}
    }
    let sortedProducts = vystup.sort(
       (p1, p2) => (p1.uid < p2.uid) ? 1 : (p1.uid > p2.uid) ? -1 : 0);
    return sortedProducts;
}


( async function() {

  var cors = require('cors')
  const app = express()

  const port = config.port;
  const host = `http://0.0.0.0:${ port }`

  // advertise an HTTP server on port 3000
  bonjour.publish({ name: 'Mobilny skladnik OASIS', type: 'http', port: config.port, host:'skladnik.local' })
  const intervalID = setInterval(() => {
    console.log('.');
    try{
      bonjour.unpublishAll();
      bonjour.publish({ name: 'Mobilny skladnik OASIS', type: 'http', port: config.port, host:'skladnik.local' })
    } catch (error) {
      console.error(error);
    }
  }, 60000);


  app.use(cors())
  console.log(__dirname);

  app.use( '/', express.static( path.join( __dirname, './src/www' ) ) )


  app.get('/scan/:id', async function(request, res) {
    res.contentType( 'application/json' )
    console.warn('You are scanned for tagId' + request.params.id)
    vysledok = await testRead(request.params.id,request.params.typ);
    res.json(vysledok)
  });

  app.get('/manual/:id/:typ', async function(request, res) {
    res.contentType( 'application/json' )
    console.warn('You are scanned for tagId' + request.params.id)
    vysledok = await testRead2(request.params.id+'*',request.params.typ);
    res.json(vysledok)
  });


  app.listen( port, async () => {
        console.log( 'Mobilny Skladnik proxy started!' )
        console.log( '        v. 20230104-001' )
        console.log( '(c) 2022 by Slavoj Hruska - Santa 3D' )
        console.log( '-------------------------------' )
	console.log( `Service is available at ${ host }/` )
   } )


} )()