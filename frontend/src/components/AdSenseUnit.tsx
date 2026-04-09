import { useEffect, useRef } from 'react';

interface AdSenseUnitProps {
  className?: string;
  format?: 'auto' | 'autorelaxed' | 'fluid' | 'rectangle';
  layout?: string;
  layoutKey?: string;
}

export default function AdSenseUnit({ 
  className = '', 
  format = 'autorelaxed',
  layout,
  layoutKey
}: AdSenseUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const adPushedRef = useRef(false);

  useEffect(() => {
    // Reset the pushed flag when component mounts
    adPushedRef.current = false;

    const pushAd = () => {
      if (adRef.current && !adPushedRef.current) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          adPushedRef.current = true;
        } catch (error) {
          console.error('Error loading AdSense ad:', error);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(pushAd, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`flex justify-center w-full ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-format={format}
        data-ad-client="ca-pub-3725056311782462"
        data-ad-slot="1633957277"
        data-ad-layout={layout}
        data-ad-layout-key={layoutKey}
        data-full-width-responsive="true"
      />
    </div>
  );
}
