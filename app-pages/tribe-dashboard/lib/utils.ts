// Helper function to extract city and state from address string
export function extractCityAndState(address: string): string {
  const parts = address.split(',').map(p => p.trim());
  const usStates = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

  // Find state index
  const stateIndex = parts.findIndex((p, i) => {
    const isState = usStates.includes(p) || (p.length === 2 && /^[A-Z]{2}$/.test(p));
    const nextIsZip = i + 1 < parts.length && /^\d{5}/.test(parts[i + 1]);
    const nextIsCountry = i + 1 < parts.length && parts[i + 1].toLowerCase().includes('united states');
    return isState && (nextIsZip || nextIsCountry || i === parts.length - 2);
  });

  if (stateIndex > 0) {
    // City is typically the part before state (skip county if present)
    // If the part before state contains "County", look one more back
    let cityIndex = stateIndex - 1;
    if (cityIndex >= 0 && parts[cityIndex].toLowerCase().includes('county')) {
      cityIndex = cityIndex - 1;
    }
    if (cityIndex >= 0) {
      return `${parts[cityIndex]}, ${parts[stateIndex]}`;
    }
  }

  // Fallback: return original if we can't parse
  return address;
}