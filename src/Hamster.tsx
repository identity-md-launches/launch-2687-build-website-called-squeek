export function HamsterPixels({ sleepy = false }: { sleepy?: boolean }) {
  return (
    <g shapeRendering="crispEdges">
      <path d="M8 12V4h12v4h12V4h12v12h4v16h-4v4H8v-4H4V16h4Z" fill="#82573d" />
      <path d="M12 8h4v8h-4zM36 8h4v8h-4z" fill="#f2b5ac" />
      <path d="M12 16h8v-4h12v4h8v4h4v12h-8v4H16v-4H8V20h4Z" fill="#e5ad74" />
      <path d="M16 24h20v8h-4v4H20v-4h-4Z" fill="#fff7e6" />
      {sleepy ? <path d="M14 22h8v2h-8zM32 22h8v2h-8z" fill="#3c3b47" /> : <path d="M16 20h4v6h-4zM34 20h4v6h-4z" fill="#303747" />}
      <path d="M16 20h2v2h-2zM34 20h2v2h-2z" fill="#fff" />
      <path d="M24 26h6v3h-6z" fill="#d3837c" />
      <path d="M25 30h4v2h-4z" fill="#82573d" />
      <path d="M10 26h6v4h-6zM38 26h6v4h-6z" fill="#efb3a2" />
    </g>
  );
}

export function HamsterMark({ sleepy = false }: { sleepy?: boolean }) {
  return <svg viewBox="0 0 52 40" aria-hidden="true" className="hamster-mark"><HamsterPixels sleepy={sleepy} /></svg>;
}

export function WheelScene({ paused, boosted }: { paused: boolean; boosted: boolean }) {
  return (
    <svg className={`wheel-art ${paused ? 'is-paused' : ''} ${boosted ? 'is-boosted' : ''}`} viewBox="0 0 640 300" role="img" aria-labelledby="wheel-title wheel-desc">
      <title id="wheel-title">Squeek’s hamster wheel</title>
      <desc id="wheel-desc">A pixel hamster runs inside a blue wheel in a tiny control room. This is a local simulation.</desc>
      <defs>
        <pattern id="room-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#dce5ff" strokeWidth="1" /></pattern>
      </defs>
      <path d="M0 0h640v300H0z" fill="url(#room-grid)" />
      <path d="M70 268h500" stroke="#c4d1f5" strokeWidth="2" />
      <path d="M230 274h166v8H230zM242 266h142v8H242z" fill="#d0dcfb" />
      <path d="m280 185-24 78h111l-29-78" fill="none" stroke="#91aaff" strokeWidth="10" strokeLinejoin="round" />
      <circle cx="310" cy="139" r="115" fill="#d9e4ff" stroke="#345bda" strokeWidth="8" />
      <circle cx="310" cy="139" r="104" fill="#f6f8ff" stroke="#a5baff" strokeWidth="4" />
      <g className="wheel-spokes">
        {[0, 45, 90, 135].map((rotation) => <path key={rotation} d="M310 36v206" transform={`rotate(${rotation} 310 139)`} stroke="#d3dfff" strokeWidth="5" />)}
        {Array.from({ length: 24 }, (_, i) => <path key={i} d="M310 28v10" transform={`rotate(${i * 15} 310 139)`} stroke="#345bda" strokeWidth="3" />)}
        <circle cx="310" cy="139" r="12" fill="#b2c5ff" />
        <circle cx="310" cy="139" r="5" fill="#345bda" />
      </g>
      <g className="running-hamster">
        <path d="M271 210h80v12h-80z" fill="#d9e3fc" />
        <g transform="translate(262 132) scale(1.75)"><HamsterPixels sleepy={paused} /></g>
        <path className="paw paw-one" d="M278 195h16v10h-16z" fill="#82573d" />
        <path className="paw paw-two" d="M327 195h16v10h-16z" fill="#82573d" />
      </g>
      <g className="room-sparkles" fill="#6e91f8">
        <path d="M159 90h5v-5h5v5h5v5h-5v5h-5v-5h-5zM447 178h4v-4h4v4h4v4h-4v4h-4v-4h-4z" />
        <path d="M458 66h5v5h-5zM167 206h4v4h-4zM125 161h4v4h-4z" />
      </g>
      <g transform="translate(472 227)" shapeRendering="crispEdges"><path d="M0 12h39v16H0z" fill="#a6bbfa" /><path d="M-4 8h47v7H-4z" fill="#829ee9" /><path d="M9 0h7v8H9zM23-4h7V8h-7z" fill="#d7a46c" /></g>
      <g transform="translate(98 232)" shapeRendering="crispEdges"><path d="M0 10h27v14H0z" fill="#c0cef0" /><path d="M6 4h15v6H6z" fill="#d3a571" /><path d="M10 0h8v6h-8z" fill="#eac38e" /></g>
      <g className="seed-particle" fill="#b8874f"><path d="M377 154h8v12h-8z" /><path d="M380 151h3v18h-3z" fill="#efd5a2" /></g>
    </svg>
  );
}
