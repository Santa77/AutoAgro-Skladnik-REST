const {path} = require( 'path' );
const {express} = require('express');
const {DBFFile} = require('dbffile');
const {wildcardRegExp} = require('wildcard-regex');


async function testRead(kod) {
    const gugl = wildcardRegExp(kod);
    let dbf = await DBFFile.open('D:\\auto-agro\\oasis\\subor\\00\\KARTY.DBF',{encoding: 'win-1250'});
    console.log(`DBF file contains ${dbf.recordCount} records.`);
//    console.log(`Field names: ${dbf.fields.map(f => f.name).join(', ')}`);
    let vystup=[];
    let records = await dbf.readRecords(dbf.recordCount);
    for (let r of records) {
	if (gugl.test(r.CMAT.toUpperCase())){
	  let p= r.PRIJEM01 + r.PRIJEM02+r.PRIJEM03+r.PRIJEM04+r.PRIJEM05+r.PRIJEM06+r.PRIJEM07+r.PRIJEM08+r.PRIJEM09+r.PRIJEM10+r.PRIJEM11+r.PRIJEM12;
	  let v= r.VYDAJ01 + r.VYDAJ02+r.VYDAJ03+r.VYDAJ04+r.VYDAJ05+r.VYDAJ06+r.VYDAJ07+r.VYDAJ08+r.VYDAJ09+r.VYDAJ10+r.VYDAJ11+r.VYDAJ12;
	  let rec = {nazov: r.NAZOV, cena_sklad: r.CENASKL, dph: r.DPH, nakup: r.CENA_N, uid: r.CMAT, cena_p1: r.CENA_P1, cena_p1sDPH: r.CENA_P1D, pociatok:r.POCSTAV, prijem: p, vydaj:v, stav:r.POCSTAV+p-v, minStav: r.MINSTAV, mj:r.MJ}
//	  console.log('Najdene');
//	  console.log(rec);
	  vystup.push(rec);
// 	  console.log(r);
	}
    }
    let sortedProducts = vystup.sort(
       (p2, p1) => (p1.uid < p2.uid) ? 1 : (p1.uid > p2.uid) ? -1 : 0);
    for (let r of sortedProducts) {
	console.log(r.nazov.replaceAll(',','-')+','+r.uid)
    }
    return sortedProducts;

}


testRead('*'.toUpperCase());
