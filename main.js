/*
 * Front‑end script to update the Addicted dashboard with live data.
 *
 * This script fetches the current $WEED price from Jupiter’s public
 * price API and the current token supply via the Solana JSON‑RPC.
 * After retrieving the data, it updates the corresponding DOM
 * elements.  It is designed to run in the browser and does not rely
 * on Node.js APIs.
 */

async function fetchWeedPrice() {
  try {
    const res = await fetch(
      'https://price.jup.ag/v4/price?ids=E2gLkTXSbbTMmJM19xkquawun2ShJSi7G59A8c2PtbFa'
    );
    const data = await res.json();
    const priceInfo = data?.data?.['E2gLkTXSbbTMmJM19xkquawun2ShJSi7G59A8c2PtbFa'];
    return priceInfo?.price || null;
  } catch (err) {
    console.error('Failed to fetch WEED price:', err);
    return null;
  }
}

async function fetchWeedSupply() {
  try {
    const payload = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getTokenSupply',
      params: ['E2gLkTXSbbTMmJM19xkquawun2ShJSi7G59A8c2PtbFa'],
    };
    const res = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    const supply = parseFloat(data.result.value.uiAmountString);
    return supply;
  } catch (err) {
    console.error('Failed to fetch token supply:', err);
    return null;
  }
}

async function updateDashboard() {
  const price = await fetchWeedPrice();
  const supply = await fetchWeedSupply();
  if (price !== null) {
    const priceEl = document.getElementById('weed-price');
    if (priceEl) {
      priceEl.textContent = `$${price.toFixed(4)}`;
    }
  }
  if (supply !== null) {
    const supplyEl = document.getElementById('current-supply');
    if (supplyEl) {
      supplyEl.textContent = supply.toLocaleString(undefined, { maximumFractionDigits: 3 });
    }
  }
}

// Update values once on page load
window.addEventListener('DOMContentLoaded', () => {
  updateDashboard();
});