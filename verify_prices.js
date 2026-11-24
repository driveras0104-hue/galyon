#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const script=fs.readFileSync(path.join(__dirname,'script.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function createHarness(savedItems){
 const elements=new Map();
 const element=id=>{if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',hidden:false,value:'',setAttribute(){},classList:{add(){},remove(){}}});return elements.get(id);};
 let stored=JSON.stringify(savedItems);
 const ctx={document:{getElementById:element,querySelectorAll:()=>[]},localStorage:{getItem:()=>stored,setItem:(key,value)=>{stored=value;}},setTimeout:()=>0,clearTimeout(){}};
 const api=vm.runInNewContext(script.slice(0,script.indexOf('// Add buttons never redirect'))+`\n({PRODUCTS,subtotal,total,shippingCost,checkoutText,renderCart,change,count,reset(items){cart={...items};renderCart();}})`,ctx);
 return {api,element,stored:()=>stored};
}
const harness=createHarness({'combo-cacao':2,'bact-subtilis':1});
const {api,element}=harness;
function hasAmount(text,value){return new RegExp('\\$'+value+'(?!\\d)').test(text);}
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}
test('Confirmed prices match every product and crop combo',()=>{
 const expected={'tricho-trichoderma':20,'tricho-trichoderma-galon':60,'bact-subtilis':20,'bact-amyloliquefaciens':20,'insecta-bt':20,'insecta-beauveria':20,'insecta-metarhizium':20,'promo-tricho-nodum':40,'promo-nodum-doble':30,'acidos-humicos-1kg':12,'acidos-fulvicos-1kg':20,'nodum-250g':20,'tricho-sustrato-1kg':25,'combo-cacao':60,'combo-mango':60,'combo-cana':60,'combo-banano':60};
 for(const [sku,price] of Object.entries(expected))assert.equal(api.PRODUCTS[sku].unit,price,sku);
 for(const match of html.matchAll(/data-product-price="([^"]+)">\$(\d+)/g))assert.equal(Number(match[2]),expected[match[1]],match[1]);
});
test('Existing saved quantities use current prices without clearing the cart',()=>{assert.equal(api.count(),3);assert.equal(api.subtotal(),140);assert.equal(api.total(),145);});
test('Each crop combo costs $60 with free shipping',()=>{for(const crop of ['cacao','mango','cana','banano']){api.reset({['combo-'+crop]:1});assert.equal(api.total(),60);assert.equal(api.shippingCost(),0);assert(api.checkoutText().includes('Total del pedido: $60'));}});
test('Retired TRICHO + humics promotion cannot be purchased or restored from saved carts',()=>{
 assert.equal(api.PRODUCTS['promo-tricho-humicos'],undefined);
 assert(!html.includes('data-add-sku="promo-tricho-humicos"'));
 const restored=createHarness({'promo-tricho-humicos':2,'combo-cacao':1,'nodum-250g':1});
 assert.equal(restored.api.count(),2);
 assert.equal(restored.api.subtotal(),80);
 assert.equal(restored.api.total(),85);
 assert(!restored.api.checkoutText().includes('de regalo'));
 restored.api.change('nodum-250g',1);
 assert.equal(JSON.parse(restored.stored())['promo-tricho-humicos'],undefined);
 assert.equal(JSON.parse(restored.stored())['combo-cacao'],1);
 assert.equal(JSON.parse(restored.stored())['nodum-250g'],2);
});
test('Estimula y protege includes 3 TRICHO liters + NODUM at $40, regular $80, with free shipping',()=>{
 const product=api.PRODUCTS['promo-tricho-nodum'];
 assert.equal(product.regularPrice,80);
 assert.equal(product.freeShipping,true);
 api.reset({'promo-tricho-nodum':1});
 assert.equal(api.total(),40);
 assert.equal(api.shippingCost(),0);
 const message=api.checkoutText();
 assert(message.includes(product.sizeLabel));
 assert(/3.*TRICHO.*1 L.*NODUM.*250 g/.test(message));
 assert(hasAmount(message,80));
 assert(/ahorro/i.test(message));
 assert(!message.includes('de regalo'));
 assert(html.includes('data-add-sku="promo-tricho-nodum"'));
});
test('Double NODUM promotion costs $30, regular $40, with free shipping',()=>{
 const product=api.PRODUCTS['promo-nodum-doble'];
 assert.equal(product.regularPrice,40);
 assert.equal(product.freeShipping,true);
 api.reset({'promo-nodum-doble':1});
 assert.equal(api.total(),30);
 assert.equal(api.shippingCost(),0);
 const message=api.checkoutText();
 assert(message.includes(product.sizeLabel));
 assert(/2.*NODUM.*250 g/.test(message));
 for(const amount of [30,40,10])assert(hasAmount(message,amount),String(amount));
 assert(html.includes('data-add-sku="promo-nodum-doble"'));
});
test('Promotion quantities scale regular prices and savings as well as the amount payable',()=>{
 api.reset({'promo-tricho-nodum':1});
 api.change('promo-tricho-nodum',1);
 assert.equal(api.total(),80);
 let message=api.checkoutText();
 assert(hasAmount(message,160));
 assert(hasAmount(message,80));
 assert(element('cart-items').innerHTML.includes('$80'));
 api.reset({'promo-nodum-doble':1});
 api.change('promo-nodum-doble',2);
 assert.equal(api.total(),90);
 message=api.checkoutText();
 for(const amount of [120,90,30])assert(hasAmount(message,amount),String(amount));
 assert.equal(JSON.parse(harness.stored())['promo-nodum-doble'],3);
});
test('Both Black Friday promotions retain free shipping and clear assistance and payment terms',()=>{
 api.reset({'promo-tricho-nodum':1,'promo-nodum-doble':1});
 assert.equal(api.subtotal(),70);
 assert.equal(api.total(),70);
 assert.equal(api.shippingCost(),0);
 const message=api.checkoutText();
 assert(message.includes(api.PRODUCTS['promo-tricho-nodum'].sizeLabel));
 assert(message.includes(api.PRODUCTS['promo-nodum-doble'].sizeLabel));
 assert(/asesor[ií]a/i.test(message));
 assert(/seguimiento/i.test(message));
 assert(/(?:no|sin)[^.\n]*contra\s*entrega/i.test(message));
 assert(!element('deal-status').textContent.includes('de regalo'));
});
test('Two BACT liters do not receive the TRICHO promotion',()=>{api.reset({'bact-subtilis':2});assert.equal(api.total(),45);assert(!api.checkoutText().includes('de regalo'));});
test('Humics and substrate use their individual prices and one shipping charge',()=>{api.reset({'acidos-humicos-1kg':2,'tricho-sustrato-1kg':1});assert.equal(api.subtotal(),49);assert.equal(api.shippingCost(),5);assert.equal(api.total(),54);});
test('Fulvics are available at $20 per 1 kg and preserve quantity, shipping and WhatsApp details',()=>{api.reset({'acidos-fulvicos-1kg':1});assert.equal(api.total(),25);api.change('acidos-fulvicos-1kg',1);assert.equal(api.subtotal(),40);assert.equal(api.total(),45);const message=api.checkoutText();for(const value of ['Ácidos Fúlvicos 60 %','1 kg','$20 c/u · $40','Total del pedido: $45'])assert(message.includes(value),value);assert(JSON.parse(harness.stored())['acidos-fulvicos-1kg']===2);assert(html.includes('data-add-sku="acidos-fulvicos-1kg"'));});
test('NODUM uses the confirmed $20 per 250 g with quantity, shipping and checkout details',()=>{api.reset({'nodum-250g':1});assert.equal(api.subtotal(),20);assert.equal(api.total(),25);api.change('nodum-250g',1);assert.equal(api.subtotal(),40);assert.equal(api.shippingCost(),5);assert.equal(api.total(),45);const message=api.checkoutText();for(const value of ['GALYON NODUM','250 g','$20 c/u · $40','Total del pedido: $45'])assert(message.includes(value),value);assert.equal(JSON.parse(harness.stored())['nodum-250g'],2);assert(html.includes('data-add-sku="nodum-250g"'));});
test('Mixed cart preserves combo free shipping and charges $5 for other items',()=>{api.reset({'combo-mango':1,'acidos-humicos-1kg':1});assert.equal(api.total(),77);assert(api.checkoutText().includes('Envío gratis en combos'));});
test('WhatsApp contains unit prices, line totals, shipping, total and destination',()=>{element('ship-city').value='Babahoyo';api.reset({'insecta-bt':2});const message=api.checkoutText();for(const text of ['$20 c/u · $40','Subtotal de productos: $40','Envío: $5','Total del pedido: $45','Babahoyo'])assert(message.includes(text),text);});
test('Quantity limits, persistence and empty cart remain functional',()=>{api.reset({'bact-subtilis':50});api.change('bact-subtilis',1);assert.equal(api.count(),50);api.change('bact-subtilis',-50);assert.equal(api.count(),0);assert.equal(api.total(),0);assert(element('drawer-footer').hidden);assert.equal(harness.stored(),'{}');});
console.log(`${passed} pricing checks passed.`);
