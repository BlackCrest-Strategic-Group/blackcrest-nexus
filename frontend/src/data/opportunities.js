const agencies=["Army","Navy","Air Force","DARPA","DHS","VA","GSA","NASA","DOE","HHS"];
const naics=["541511","541512","541519","541330","541614","336411","332710","611430"];
const types=["SBIR","8(a)","WOSB","Full & Open"];
const today = new Date();
export const opportunities = Array.from({length:20}).map((_,i)=>({
  id:i+1,title:`${agencies[i%agencies.length]} Digital Modernization Support Lot ${i+1}`,
  solicitation:`${agencies[i%agencies.length].slice(0,2).toUpperCase()}-${2026+i}-${1000+i}`,
  agency:agencies[i%agencies.length], naics:naics[i%naics.length], setAside:types[i%types.length],
  value:50000 + i*2350000, deadline:new Date(today.getTime()+((30+i*3)%90)*86400000).toISOString().slice(0,10),
  competition:i%2?"Single-award":"IDIQ", description:"SAM.gov style requirement for engineering, data and cyber support.",
  poc:{name:`POC ${i+1}`,email:`poc${i+1}@agency.gov`}
}));
