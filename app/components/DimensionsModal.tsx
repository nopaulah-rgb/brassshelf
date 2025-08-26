import React from 'react';

type Unit = 'inch' | 'mm';

interface DimensionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: Unit;
  userHeight: number; // in selected unit
  userWidth: number; // per bay, in selected unit
  shelfDepth: number; // in selected unit
  totalDepth: number; // in selected unit
  shelfQuantity: number;
  barCount: number;
  baySpacingMm: number; // mm (legacy single spacing)
  baySpacingsMm?: number[]; // mm (individual bay spacings)
  useIndividualSpacing: boolean;
  shelfSpacingMm?: number; // mm when equal spacing
  shelfSpacingsMm?: number[]; // mm when individual spacing
  frontImg?: string;
  sideImg?: string;
  topImg?: string;
}

const unitSymbol = (unit: Unit): string => (unit === 'inch' ? '"' : 'mm');

const mmToUnit = (mm: number, unit: Unit): number => {
  if (unit === 'inch') return mm / 25.4;
  return mm; // mm
};

const unitToMm = (value: number, unit: Unit): number => {
  if (unit === 'inch') return value * 25.4;
  return value; // mm
};

const formatNumber = (value: number): string => {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? `${rounded}` : `${rounded}`;
};

const DimensionsModal: React.FC<DimensionsModalProps> = ({
  isOpen,
  onClose,
  unit,
  userHeight,
  userWidth,
  shelfDepth,
  totalDepth,
  shelfQuantity,
  barCount,
  baySpacingMm,
  baySpacingsMm,
  useIndividualSpacing,
  shelfSpacingMm,
  shelfSpacingsMm,
  frontImg,
  sideImg,
  topImg,
}) => {
  if (!isOpen) return null;

  // Total width across bays including spacing (calculated in mm for precision)
  const widthPerBayMm = unitToMm(userWidth, unit);
  
  // Calculate total width using individual bay spacings if available
  const totalWidthMm = barCount > 1
    ? (() => {
        if (baySpacingsMm && baySpacingsMm.length > 0) {
          // Use individual bay spacings
          const totalSpacing = baySpacingsMm.reduce((sum, spacing) => sum + spacing, 0);
          return (barCount * widthPerBayMm) + totalSpacing;
        } else {
          // Fall back to uniform spacing
          return (barCount * widthPerBayMm) + (barCount - 1) * baySpacingMm;
        }
      })()
    : widthPerBayMm;
  const totalWidthInSelectedUnit = mmToUnit(totalWidthMm, unit);

  const baySpacingInSelectedUnit = mmToUnit(baySpacingMm, unit);

  // Shelf spacing presentation
  const shelfSpacingText = useIndividualSpacing
    ? (shelfSpacingsMm && shelfSpacingsMm.length > 0
        ? shelfSpacingsMm
            .map((mm, idx) => `${idx + 1}: ${formatNumber(mmToUnit(mm, unit))}${unitSymbol(unit)}`)
            .join(', ')
        : '—')
    : (typeof shelfSpacingMm === 'number' 
        ? `${formatNumber(mmToUnit(shelfSpacingMm, unit))}${unitSymbol(unit)}`
        : '—');

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Dimensions</h3>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Height</div>
            <div className="text-base font-medium text-gray-900">
              {formatNumber(userHeight)}{unitSymbol(unit)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Width (per bay)</div>
            <div className="text-base font-medium text-gray-900">
              {formatNumber(userWidth)}{unitSymbol(unit)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Total Width</div>
            <div className="text-base font-medium text-gray-900">
              {formatNumber(totalWidthInSelectedUnit)}{unitSymbol(unit)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Shelf Depth</div>
            <div className="text-base font-medium text-gray-900">
              {formatNumber(shelfDepth)}{unitSymbol(unit)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Total Depth</div>
            <div className="text-base font-medium text-gray-900">
              {formatNumber(totalDepth)}{unitSymbol(unit)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Number of Shelves</div>
            <div className="text-base font-medium text-gray-900">{shelfQuantity}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Number of Bays</div>
            <div className="text-base font-medium text-gray-900">{barCount}</div>
          </div>
          <div className="space-y-1 col-span-2">
            <div className="text-sm text-gray-500">Bay Spacing</div>
            <div className="text-base font-medium text-gray-900">
              {barCount > 1 ? `${formatNumber(baySpacingInSelectedUnit)}${unitSymbol(unit)}` : '—'}
            </div>
          </div>
          <div className="space-y-1 col-span-2">
            <div className="text-sm text-gray-500">Shelf Spacing</div>
            <div className="text-base font-medium text-gray-900 break-words">
              {shelfSpacingText}
            </div>
          </div>
        </div>

        {/* Technical Views */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-black px-3 py-1 text-sm font-semibold text-white">HOME</span>
            <span className="text-xs text-gray-500">Front view with overall width and height</span>
          </div>
          <div className="relative rounded-lg border bg-white p-3">
            {frontImg && (
              <img src={frontImg} alt="front" className="h-auto w-full rounded-md border object-contain" />
            )}
            <HomeOverlay
              unit={unit}
              height={userHeight}
              totalWidth={totalWidthInSelectedUnit}
              widthPerBay={userWidth}
              useIndividualSpacing={useIndividualSpacing}
              shelfSpacingMm={shelfSpacingMm}
              shelfSpacingsMm={shelfSpacingsMm}
              baySpacingMm={barCount > 1 ? baySpacingMm : undefined}
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-black px-3 py-1 text-sm font-semibold text-white">SIDE</span>
            <span className="text-xs text-gray-500">Side view with depths</span>
          </div>
          <div className="relative rounded-lg border bg-white p-3">
            {sideImg && (
              <img src={sideImg} alt="side" className="h-auto w-full rounded-md border object-contain" />
            )}
            <SideOverlay
              unit={unit}
              height={userHeight}
              shelfDepth={shelfDepth}
              totalDepth={totalDepth}
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-black px-3 py-1 text-sm font-semibold text-white">TOP</span>
            <span className="text-xs text-gray-500">Top view with widths</span>
          </div>
          <div className="relative rounded-lg border bg-white p-3">
            {topImg && (
              <img src={topImg} alt="top" className="h-auto w-full rounded-md border object-contain" />
            )}
            <TopOverlay
              unit={unit}
              widthPerBay={userWidth}
              totalWidth={totalWidthInSelectedUnit}
              shelfDepth={shelfDepth}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DimensionsModal;

// ---------- Overlays placed on top of screenshots ----------
const OverlayText: React.FC<{ x: number; y: number; text: string; anchor?: 'start'|'middle'|'end' }>
  = ({ x, y, text, anchor = 'middle' }) => (
  <text x={x} y={y} textAnchor={anchor} fontSize="12" fill="#111">{text}</text>
);

const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number }>
  = ({ x1, y1, x2, y2 }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1E3A5F" strokeWidth="2" markerStart="url(#arrowBlue)" markerEnd="url(#arrowBlue)" />
);

const OverlayDefs = () => (
  <defs>
    <marker id="arrowBlue" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#1E3A5F" />
    </marker>
  </defs>
);

const HomeOverlay: React.FC<{
  unit: Unit;
  height: number;
  totalWidth: number;
  widthPerBay: number;
  useIndividualSpacing?: boolean;
  shelfSpacingMm?: number;
  shelfSpacingsMm?: number[];
  baySpacingMm?: number;
}> = ({ unit, height, totalWidth, widthPerBay, useIndividualSpacing, shelfSpacingMm, shelfSpacingsMm, baySpacingMm }) => (
  <svg viewBox="0 0 1000 320" className="pointer-events-none absolute inset-0">
    <OverlayDefs />
    {/* total width and left height hidden per request */}
    {false && (
      <>
        <Arrow x1={100} y1={290} x2={900} y2={290} />
        <OverlayText x={500} y={282} text={`${formatNumber(totalWidth)}${unitSymbol(unit)}`} />
        <Arrow x1={60} y1={40} x2={60} y2={260} />
        <OverlayText x={50} y={150} text={`${formatNumber(height)}${unitSymbol(unit)}`} anchor="end" />
      </>
    )}
    {/* center to center hidden per request */}
    {false && (
      <OverlayText x={500} y={260} text={`Center to center: ${formatNumber(widthPerBay)}${unitSymbol(unit)}`} />
    )}
    {/* shelf spacings list on right */}
    {(() => {
      const spacings = useIndividualSpacing && shelfSpacingsMm && shelfSpacingsMm.length > 0
        ? shelfSpacingsMm.map(mm => mmToUnit(mm, unit))
        : (typeof shelfSpacingMm === 'number' ? [mmToUnit(shelfSpacingMm, unit)] : []);
      if (spacings.length === 0) return null;
      let y = 250;
      return spacings.slice(0, 8).map((val, idx) => {
        const y2 = y - 24;
        const label = `${formatNumber(val)}${unitSymbol(unit)}`;
        const node = (
          <g key={idx}>
            <line x1={920} y1={y} x2={920} y2={y2} stroke="#1E3A5F" strokeWidth="1.2" markerStart="url(#arrowBlue)" markerEnd="url(#arrowBlue)" />
            <OverlayText x={930} y={(y + y2) / 2} text={label} anchor="start" />
          </g>
        );
        y -= 30;
        return node;
      });
    })()}

    {/* right-side vertical dimension showing shelf spacing (e.g., 12") like reference HOME drawing */}
    {(() => {
      const singleSpacingMm = useIndividualSpacing && shelfSpacingsMm && shelfSpacingsMm.length > 0
        ? shelfSpacingsMm[0]
        : (typeof shelfSpacingMm === 'number' ? shelfSpacingMm : undefined);
      const showShelfSpacing = typeof singleSpacingMm === 'number';
      const showBaySpacing = !showShelfSpacing && typeof baySpacingMm === 'number' && baySpacingMm > 0;
      if (!showShelfSpacing && !showBaySpacing) return null;
      const valueInUnit = mmToUnit(showShelfSpacing ? singleSpacingMm as number : baySpacingMm as number, unit);
      // Position near right post; if bay spacing, center a bit lower for clarity
      const x = 650; // closer to the model
      const yBottom = showShelfSpacing ? 88 : 225;
      const yTop = showShelfSpacing ? 152 : 185;
      const label = showShelfSpacing ? `${formatNumber(valueInUnit)}${unitSymbol(unit)}` : `Bay: ${formatNumber(valueInUnit)}${unitSymbol(unit)}`;
      return (
        <g>
          <Arrow x1={x} y1={yTop} x2={x} y2={yBottom} />
          <OverlayText x={x + 3} y={(yTop + yBottom) / 2} text={label} anchor="start" />
        </g>
      );
    })()}
  </svg>
);

const SideOverlay: React.FC<{ unit: Unit; height: number; shelfDepth: number; totalDepth: number }> = ({ unit, height, shelfDepth, totalDepth }) => (
  <svg viewBox="0 0 1000 350" className="pointer-events-none absolute inset-x-0 bottom-0">
    <OverlayDefs />
    {/* total depth bottom */}
    <Arrow x1={520} y1={330} x2={920} y2={330} />
    <OverlayText x={720} y={322} text={`${formatNumber(totalDepth)}${unitSymbol(unit)}`} />
    {/* shelf depth callout */}
    <Arrow x1={520} y1={280} x2={780} y2={280} />
    <OverlayText x={650} y={272} text={`${formatNumber(shelfDepth)}${unitSymbol(unit)}`} />
    {/* height left */}
    <Arrow x1={80} y1={60} x2={80} y2={300} />
    <OverlayText x={70} y={190} text={`${formatNumber(height)}${unitSymbol(unit)}`} anchor="end" />

    {/* short-edge style vertical markers on the right to show depths */}
    <Arrow x1={930} y1={110} x2={930} y2={270} />
    <OverlayText x={940} y={190} text={`${formatNumber(totalDepth)}${unitSymbol(unit)}`} anchor="start" />
    <line x1={900} y1={130} x2={900} y2={250} stroke="#1E3A5F" strokeWidth="1.6" markerStart="url(#arrowBlue)" markerEnd="url(#arrowBlue)" />
    <OverlayText x={910} y={190} text={`${formatNumber(shelfDepth)}${unitSymbol(unit)}`} anchor="start" />
  </svg>
);

const TopOverlay: React.FC<{ unit: Unit; widthPerBay: number; totalWidth: number; shelfDepth: number }> = ({ unit, widthPerBay, totalWidth, shelfDepth }) => (
  <svg viewBox="0 0 1000 260" className="pointer-events-none absolute inset-x-0 bottom-0">
    <OverlayDefs />
    {/* total width */}
    <Arrow x1={120} y1={240} x2={880} y2={240} />
    <OverlayText x={500} y={232} text={`${formatNumber(totalWidth)}${unitSymbol(unit)}`} />
    {/* center-to-center sample */}
    {totalWidth > 0 && (
      <>
        <Arrow x1={120} y1={210} x2={120 + 600 * (widthPerBay / totalWidth)} y2={210} />
        <OverlayText x={120 + 300 * (widthPerBay / totalWidth)} y={202} text={`${formatNumber(widthPerBay)}${unitSymbol(unit)}`} />
      </>
    )}
    {/* depth right side */}
    <Arrow x1={900} y1={70} x2={900} y2={70 + 120 * (shelfDepth / Math.max(shelfDepth, 1))} />
    <OverlayText x={910} y={130} text={`${formatNumber(shelfDepth)}${unitSymbol(unit)}`} anchor="start" />
  </svg>
);

// ---------- SVG Views (legacy internal drawings kept for reference/overlay fallback) ----------
// (Legacy SVG view components removed in favor of screenshot overlays)
