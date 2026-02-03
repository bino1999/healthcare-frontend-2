import { useEffect, useMemo, useState } from 'react';
import { getBeds } from '../../api/bed';
import KpiCards from './KpiCards';

function BedKpiCards({ refreshKey = 0 }) {
  const [beds, setBeds] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadBeds = async () => {
      try {
        const data = await getBeds();
        if (isMounted) {
          setBeds(data || []);
        }
      } catch (error) {
        if (isMounted) {
          setBeds([]);
        }
      }
    };

    loadBeds();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const counts = useMemo(() => {
    const summary = {
      total: beds.length,
      occupied: 0,
      booking: 0,
      vacant: 0
    };

    beds.forEach((bed) => {
      const status = (bed?.Status || '').toLowerCase();
      if (status.includes('occup')) summary.occupied += 1;
      else if (status.includes('book')) summary.booking += 1;
      else if (status.includes('vacant')) summary.vacant += 1;
    });

    return summary;
  }, [beds]);

  const items = useMemo(
    () => [
      { label: 'Total Beds', value: counts.total },
      { label: 'Occupied Beds', value: counts.occupied },
      { label: 'Booking Beds', value: counts.booking },
      { label: 'Vacant Beds', value: counts.vacant }
    ],
    [counts]
  );

  return <KpiCards items={items} />;
}

export default BedKpiCards;
