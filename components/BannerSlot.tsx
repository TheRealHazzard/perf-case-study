'use client';

import { useEffect, useState } from 'react';

export default function BannerSlot() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 600);
    return () => clearTimeout(t);
  }, []);
  return <div className="banner-slot">{show && <div className="banner">Free shipping on orders over $150 this week.</div>}</div>;
}
