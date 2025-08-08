import { json } from "@remix-run/node";
import { useRouteError } from "@remix-run/react";
import { useState } from "react";
import React from "react";
import ThreeDViewer, { ThreeDViewerHandle } from "~/components/ThreeDViewer";
import CrossbarSelector from "~/components/CrossbarSelector";
import UseTopShelfSelector from "~/components/UseTopShelfSelector";

// Components
import RipSelector from "~/components/RipSelector";
import ShelfSelector from "~/components/ShelfSelector";
import ShelfQuantitySelector from "~/components/ShelfQuantitySelector";
import ShelfSpacingSelector from "~/components/ShelfSpacingSelector";
import IndividualShelfSpacingSelector from "~/components/IndividualShelfSpacingSelector";
import MountTypeSelector from "~/components/MountTypeSelector";
import BarSelector from "~/components/BarSelector";
import DimensionInputs from "~/components/DimensionInputs";
import PipeDiameterSelector from "~/components/PipeDiameterSelector";
import PriceAndActions from "~/components/PriceAndActions";
import DimensionsModal from "~/components/DimensionsModal";
import WallConnectionSelector from "~/components/WallConnectionSelector";
import BaySpacingInput from "~/components/BaySpacingInput";

// Loader function for server-side data fetching (if needed)
export const loader = async () => {
  return json({});
};

export default function Index() {
  // State for storing user selections
  const [selectedShelf, setSelectedShelf] = useState<string | null>('/models/Glass Shelf v1_B.glb');
  const [selectedRip, setSelectedRip] = useState<string | null>('/models/50cmRib.stl');
  const [shelfQuantity, setShelfQuantity] = useState<number>(1);
  const [shelfSpacing, setShelfSpacing] = useState<number>(250); // in mm
  const [useIndividualSpacing, setUseIndividualSpacing] = useState<boolean>(false);
  const [shelfSpacings, setShelfSpacings] = useState<number[]>([250]); // in mm - array for individual spacing
  const [mountType, setMountType] = useState<string>("ceiling");
  const [barCount, setBarCount] = useState<number>(1);
  const [baySpacing, setBaySpacing] = useState<number>(0); // Bay spacing in mm - default 0 (birleşik)
  const [userHeight, setUserHeight] = useState<number>(42); // in inches
  const [userWidth, setUserWidth] = useState<number>(36); // in inches
  const [shelfDepth, setShelfDepth] = useState<number>(12); // in inches
  const [totalDepth, setTotalDepth] = useState<number>(12); // in inches
  const [unit, setUnit] = useState<'inch' | 'cm'>('inch');
  const [useTopShelf, setUseTopShelf] = useState<boolean>(false);
  const [price] = useState<number>(599);
  const [isDimensionsOpen, setIsDimensionsOpen] = useState<boolean>(false);
  const viewerRef = React.useRef<ThreeDViewerHandle | null>(null);
  const [shots, setShots] = useState<{front?: string; side?: string; top?: string}>({});

  // Material selections
  const [pipeDiameter, setPipeDiameter] = useState<string>('5/8');

  // Crossbar settings
  const [frontBars, setFrontBars] = useState<boolean>(true);
  const [selectedShelvesForBars, setSelectedShelvesForBars] = useState<number[]>([]);
  const [backBars, setBackBars] = useState<boolean>(false);
  const [selectedShelvesForBackBars, setSelectedShelvesForBackBars] = useState<number[]>([]);

  // Space adjustments (simplified - keeping only essential ones)
  const [verticalBarsAtBack] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Wall connection point selection
  const [wallConnectionPoint, setWallConnectionPoint] = useState<string[]>(['all']);

  // Determine if all necessary selections have been made
  const isViewerReady = selectedShelf && selectedRip;

  // Set loading false after a short delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handler functions
  const handleExport = () => {
    // Get the canvas element from ThreeJS
    const canvas = document.querySelector('canvas');
    if (canvas) {
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `shelf-configuration-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    }
  };

  const handleAddToCart = () => {
    // Prepare configuration data
    const configuration = {
      mountType,
      dimensions: {
        height: userHeight,
        width: userWidth,
        shelfDepth,
        totalDepth,
        unit
      },
      shelfQuantity,
      barCount,
      materials: {
        pipeDiameter
      },
      crossbars: {
        front: frontBars
      },
      price
    };
    
    console.log('Adding to cart:', configuration);
    // Here you would typically send this data to your cart/backend
    alert('Configuration added to cart!');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Configuration Panel */}
          <div className="w-full lg:w-1/2 space-y-4">
            {/* Left Column - Configuration Options */}
            <div className="space-y-4">
              <MountTypeSelector onSelect={setMountType} />
              
              <WallConnectionSelector 
                onSelect={setWallConnectionPoint}
                mountType={mountType}
              />
              
              <DimensionInputs
                height={userHeight}
                width={userWidth}
                shelfDepth={shelfDepth}
                totalDepth={totalDepth}
                unit={unit}
                onHeightChange={setUserHeight}
                onWidthChange={setUserWidth}
                onShelfDepthChange={setShelfDepth}
                onTotalDepthChange={setTotalDepth}
                onUnitChange={setUnit}
              />

              <ShelfQuantitySelector onSelect={setShelfQuantity} />
              
              {/* Spacing Mode Toggle */}
              <div className="bg-[#8BBBD9] rounded-lg p-4">
                <h3 className="text-[#1E3A5F] font-semibold mb-3">Shelf Spacing Mode:</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUseIndividualSpacing(false)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !useIndividualSpacing
                        ? 'bg-[#1E3A5F] text-white'
                        : 'bg-white/60 text-[#1E3A5F] border border-[#1E3A5F]/20'
                    }`}
                  >
                    Equal Spacing
                  </button>
                  <button
                    onClick={() => setUseIndividualSpacing(true)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      useIndividualSpacing
                        ? 'bg-[#1E3A5F] text-white'
                        : 'bg-white/60 text-[#1E3A5F] border border-[#1E3A5F]/20'
                    }`}
                  >
                    Individual Spacing
                  </button>
                </div>
              </div>

              {/* Conditional Spacing Selector */}
              {!useIndividualSpacing ? (
                <ShelfSpacingSelector onSelect={setShelfSpacing} />
              ) : (
                              <IndividualShelfSpacingSelector 
                shelfQuantity={shelfQuantity}
                onSpacingChange={(spacings) => {
                  console.log('Shelf spacings updated:', spacings);
                  setShelfSpacings([...spacings]); // Yeni array oluştur
                }}
                defaultSpacing={shelfSpacing}
              />
              )}
              
              <BarSelector onSelect={setBarCount} />
              
              <BaySpacingInput 
                baySpacing={baySpacing}
                onBaySpacingChange={setBaySpacing}
                barCount={barCount}
              />
              
              <PipeDiameterSelector
                pipeDiameter={pipeDiameter}
                onChange={setPipeDiameter}
              />

              {/* Hidden ShelfSelector for logic */}
              <ShelfSelector 
                onSelect={setSelectedShelf} 
                shelfMaterial="glass"
              />
              
              {/* Rip Selector */}
              <div className="bg-[#8BBBD9] rounded-lg p-4">
                <h3 className="text-[#1E3A5F] font-semibold mb-3">Rip Length:</h3>
                <RipSelector onSelect={setSelectedRip} />
              </div>

              <CrossbarSelector
                frontBars={frontBars}
                onFrontBarsChange={setFrontBars}
                backBars={backBars}
                onBackBarsChange={setBackBars}
                mountType={mountType}
                shelfCount={shelfQuantity}
                selectedShelves={selectedShelvesForBars}
                onSelectedShelvesChange={setSelectedShelvesForBars}
                selectedBackShelves={selectedShelvesForBackBars}
                onSelectedBackShelvesChange={setSelectedShelvesForBackBars}
              />

              <div className="bg-[#8BBBD9] rounded-lg p-4">
                <UseTopShelfSelector
                  mountType={mountType}
                  useTopShelf={useTopShelf}
                  onChange={setUseTopShelf}
                />
              </div>
            </div>
          </div>

          {/* Right Column - 3D Viewer and Actions */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {isLoading ? (
                <div className="w-full h-[400px] flex items-center justify-center p-8 bg-gray-50">
                  <div className="text-center">
                    <h2 className="text-xl font-medium text-gray-700 mb-2">
                      Loading 3D Model...
                    </h2>
                    <p className="text-gray-500">
                      Please wait
                    </p>
                  </div>
                </div>
              ) : isViewerReady ? (
                <div className="w-full h-[400px]">
                  <ThreeDViewer
                    ref={viewerRef}
                    shelfUrl={selectedShelf}
                    ripUrl={selectedRip}
                    shelfQuantity={shelfQuantity}
                    shelfSpacing={useIndividualSpacing ? shelfSpacings[0] || 250 : shelfSpacing}
                    shelfSpacings={useIndividualSpacing && shelfSpacings.length > 0 ? [...shelfSpacings] : undefined}
                    mountType={mountType}
                    barCount={barCount}
                    baySpacing={baySpacing}
                    showCrossbars={frontBars || backBars}
                    userHeight={unit === 'inch' ? userHeight * 25.4 : userHeight * 10}
                    userWidth={unit === 'inch' ? userWidth * 25.4 : userWidth * 10}
                    shelfDepth={unit === 'inch' ? shelfDepth * 25.4 : shelfDepth * 10}
                    useTopShelf={useTopShelf}
                    pipeDiameter={pipeDiameter}
                    frontBars={frontBars}
                    backBars={backBars}
                    verticalBarsAtBack={verticalBarsAtBack}
                    wallConnectionPoint={wallConnectionPoint}
                    selectedShelvesForBars={selectedShelvesForBars}
                    selectedBackShelvesForBars={selectedShelvesForBackBars}
                  />
                </div>
              ) : (
                <div className="w-full h-[400px] flex items-center justify-center p-8 bg-gray-50">
                  <div className="text-center">
                    <h2 className="text-xl font-medium text-gray-700 mb-2">
                      Configuration Preview
                    </h2>
                    <p className="text-gray-500">
                      Your custom shelf will appear here
                    </p>
                  </div>
                </div>
              )}
              
              {/* Show Dimensions Button */}
              <div className="p-4 border-t">
                <button 
                  onClick={async () => {
                    if (viewerRef.current) {
                      const imgs = await viewerRef.current.captureViews();
                      setShots(imgs);
                    }
                    setIsDimensionsOpen(true);
                  }}
                  className="w-full py-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Show Dimensions
                </button>
              </div>
            </div>

            {/* Price and Actions */}
            <PriceAndActions
              price={price}
              onExport={handleExport}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>
      </main>

      {/* Dimensions Modal */}
      <DimensionsModal
        isOpen={isDimensionsOpen}
        onClose={() => setIsDimensionsOpen(false)}
        unit={unit}
        userHeight={userHeight}
        userWidth={userWidth}
        shelfDepth={shelfDepth}
        totalDepth={totalDepth}
        shelfQuantity={shelfQuantity}
        barCount={barCount}
        baySpacingMm={baySpacing}
        useIndividualSpacing={useIndividualSpacing}
        shelfSpacingMm={!useIndividualSpacing ? shelfSpacing : undefined}
        shelfSpacingsMm={useIndividualSpacing ? shelfSpacings : undefined}
        frontImg={shots.front}
        sideImg={shots.side}
        topImg={shots.top}
      />
    </div>
  );
}

// ErrorBoundary for handling errors gracefully
export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold text-red-600">An Error Occurred</h1>
      <p className="text-lg text-gray-700 mt-4">
        {error instanceof Error ? error.message : "An unknown error occurred."}
      </p>
    </div>
  );
}
