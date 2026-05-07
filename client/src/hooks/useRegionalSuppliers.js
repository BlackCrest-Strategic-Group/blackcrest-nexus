import { useMemo, useState } from 'react';
import { getRegionalSuppliers } from '../services/supplierService';

export default function useRegionalSuppliers() {
  const suppliers = useMemo(() => getRegionalSuppliers(), []);
  const regions = useMemo(
    () => ['All Regions', ...new Set(suppliers.map((supplier) => supplier.region))],
    [suppliers]
  );
  const [activeRegion, setActiveRegion] = useState('All Regions');

  const filteredSuppliers = useMemo(() => {
    if (activeRegion === 'All Regions') {
      return suppliers;
    }

    return suppliers.filter((supplier) => supplier.region === activeRegion);
  }, [suppliers, activeRegion]);

  return {
    suppliers,
    regions,
    activeRegion,
    setActiveRegion,
    filteredSuppliers,
  };
}
