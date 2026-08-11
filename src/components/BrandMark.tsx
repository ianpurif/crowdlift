interface BrandMarkProps {
  compact?: boolean;
  inverse?: boolean;
}

export default function BrandMark({ compact = false, inverse = false }: BrandMarkProps) {
  return (
    <span className="brand-lockup" aria-label="CrowdLift">
      <span className="brand-symbol" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {!compact && (
        <span className={`brand-wordmark ${inverse ? "brand-wordmark-inverse" : ""}`}>
          Crowd<span>Lift</span>
        </span>
      )}
    </span>
  );
}
