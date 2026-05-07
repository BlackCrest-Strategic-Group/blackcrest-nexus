import React from 'react'; const tabs=['Industrial Materials','Logistics Capacity','Teaming & Subs'];
const listings=Array.from({length:45}).map((_,i)=>({id:i+1,title:`Listing ${i+1}`,supplier:`Supplier ${i+1}`,location:['DE','PHL','BWI'][i%3],price:1000+i*100,cert:'ISO9001'}));
export default function(){return <div><h2>Marketplace</h2><p>{tabs.join(' | ')}</p>{listings.slice(0,15).map(l=><div key={l.id} className='panel' style={{padding:8,marginTop:8}}>{l.title} - {l.supplier} - ${l.price}</div>)}</div>}
