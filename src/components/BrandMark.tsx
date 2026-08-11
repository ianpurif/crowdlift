import Image from "next/image";

interface BrandMarkProps {
  compact?: boolean;
  inverse?: boolean;
}

export default function BrandMark({ compact = false, inverse = false }: BrandMarkProps) {
  return (
    <span className="brand-lockup" aria-label="CrowdLift">
      <Image
        className="brand-product-logo"
        src="/icon.png"
        width={30}
        height={30}
        alt=""
        loading="eager"
      />
      {!compact && (
        <span className={`brand-wordmark ${inverse ? "brand-wordmark-inverse" : ""}`}>
          Crowd<span>Lift</span>
        </span>
      )}
    </span>
  );
}
