import { json } from "@remix-run/node";
import { useRouteError } from "@remix-run/react";
import React, { useState, useCallback } from "react";
import ThreeDViewer, { ThreeDViewerHandle } from "~/components/ThreeDViewer";
import CrossbarSelector from "~/components/CrossbarSelector";
import UseTopShelfSelector from "~/components/UseTopShelfSelector";
import BackVerticalSelector from "~/components/BackVerticalSelector";

// Components
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

  const [shelfQuantity, setShelfQuantity] = useState<number>(1);
  const [shelfSpacing, setShelfSpacing] = useState<number>(250); // in mm
  const [useIndividualSpacing, setUseIndividualSpacing] = useState<boolean>(false);
  const [shelfSpacings, setShelfSpacings] = useState<number[]>([250]); // in mm - array for individual spacing
  const [mountType, setMountType] = useState<string>("ceiling");
  const [barCount, setBarCount] = useState<number>(1);
  const [baySpacing, setBaySpacing] = useState<number>(0); // Bay spacing in mm - default 0 (birleşik) - legacy
  const [baySpacings, setBaySpacings] = useState<number[]>([]); // Individual bay spacings in mm
  const [userHeight, setUserHeight] = useState<number>(42); // in inches
  const [userWidth, setUserWidth] = useState<number>(36); // in inches
  const [shelfDepth, setShelfDepth] = useState<number>(12); // in inches
  const [totalDepth, setTotalDepth] = useState<number>(12); // in inches
  const [selectedDepthType, setSelectedDepthType] = useState<'shelf' | 'total'>('shelf'); // Track which depth type is selected
  const [unit, setUnit] = useState<'inch' | 'mm'>('inch');
  const [useTopShelf, setUseTopShelf] = useState<boolean>(false);
  const [price] = useState<number>(599);
  const [isDimensionsOpen, setIsDimensionsOpen] = useState<boolean>(false);
  const viewerRef = React.useRef<ThreeDViewerHandle | null>(null);
  const [shots, setShots] = useState<{front?: string; side?: string; top?: string}>({});

  // Material selections
  const [pipeDiameter, setPipeDiameter] = useState<string>('5/8');

  // Crossbar settings
  const [frontBars, setFrontBars] = useState<boolean>(false);
  const [selectedShelvesForBars, setSelectedShelvesForBars] = useState<number[]>([]);
  const [backBars, setBackBars] = useState<boolean>(false);
  const [selectedShelvesForBackBars, setSelectedShelvesForBackBars] = useState<number[]>([]);

  // Space adjustments (simplified - keeping only essential ones)
  const [verticalBarsAtBack] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Wall connection point selection
  const [wallConnectionPoint, setWallConnectionPoint] = useState<string[]>(['all']);
  
  // Back vertical connection selection
  const [backVertical, setBackVertical] = useState<boolean>(true);

  // Validation function to check if all values are within valid ranges
  const areValuesValid = () => {
    // Check width (5-100 inches)
    const widthInInches = unit === 'inch' ? userWidth : Math.round((userWidth / 25.4) * 100) / 100;
    if (widthInInches < 5 || widthInInches > 100) {
      return false;
    }

    // Check shelf depth (12-20 inches)
    const shelfDepthInInches = unit === 'inch' ? shelfDepth : Math.round((shelfDepth / 25.4) * 100) / 100;
    if (shelfDepthInInches < 12 || shelfDepthInInches > 20) {
      return false;
    }

    // Check individual spacing values (6-70 inches)
    if (useIndividualSpacing && shelfSpacings.length > 0) {
      for (const spacing of shelfSpacings) {
        const spacingInInches = Math.round((spacing / 25.4) * 100) / 100; // Convert mm to inches
        if (spacingInInches < 6 || spacingInInches > 70) {
          return false;
        }
      }
    }

    return true;
  };

  // Get validation message
  const getValidationMessage = () => {
    const widthInInches = unit === 'inch' ? userWidth : userWidth / 25.4;
    const shelfDepthInInches = unit === 'inch' ? shelfDepth : shelfDepth / 25.4;
    
    if (widthInInches < 5 || widthInInches > 100) {
      const displayValue = unit === 'inch' ? userWidth : Math.round(userWidth);
      const unitLabel = unit === 'inch' ? 'inch' : 'mm';
      return `Width must be between 5" and 100". Current value: ${displayValue} ${unitLabel}`;
    }
    
    if (shelfDepthInInches < 12 || shelfDepthInInches > 20) {
      const displayValue = unit === 'inch' ? shelfDepth : Math.round(shelfDepth);
      const unitLabel = unit === 'inch' ? 'inch' : 'mm';
      return `Shelf depth must be between 12" and 20". Current value: ${displayValue} ${unitLabel}`;
    }

    if (useIndividualSpacing && shelfSpacings.length > 0) {
      for (let i = 0; i < shelfSpacings.length; i++) {
        const spacingInInches = shelfSpacings[i] / 25.4;
        if (spacingInInches < 6 || spacingInInches > 70) {
          const displayValue = Math.round(shelfSpacings[i]);
          return `Shelf spacing ${i + 1} must be between 6" and 70". Current value: ${displayValue} mm`;
        }
      }
    }

    return '';
  };

  // Callback for individual spacing changes
  const handleIndividualSpacingChange = useCallback((spacings: number[]) => {
    console.log('Shelf spacings updated:', spacings);
    setShelfSpacings(spacings);
  }, []);

  // Handle depth type selection change
  const handleDepthTypeChange = (depthType: 'shelf' | 'total') => {
    setSelectedDepthType(depthType);
    // When switching depth types, copy the current value to maintain consistency
    if (depthType === 'shelf') {
      setShelfDepth(totalDepth);
    } else {
      setTotalDepth(shelfDepth);
    }
  };

  // Handle shelf depth change
  const handleShelfDepthChange = (value: number) => {
    setShelfDepth(value);
    // If shelf depth is selected, update total depth to match
    if (selectedDepthType === 'shelf') {
      setTotalDepth(value);
    }
  };

  // Handle total depth change
  const handleTotalDepthChange = (value: number) => {
    setTotalDepth(value);
    // If total depth is selected, update shelf depth to match
    if (selectedDepthType === 'total') {
      setShelfDepth(value);
    }
  };

  // Function to reset selections when mount type changes
  const resetSelections = (newMountType: string) => {
    // Reset wall connection points to default
    setWallConnectionPoint(['all']);
    
    // Reset crossbar selections
    setFrontBars(false);
    setBackBars(false);
    setSelectedShelvesForBars([]);
    setSelectedShelvesForBackBars([]);
    
    // Reset use top shelf selection
    setUseTopShelf(false);
    
    // Reset shelf quantity to default
    setShelfQuantity(1);
    
    // Reset spacing to default
    setShelfSpacing(250);
    setShelfSpacings([250]);
    setUseIndividualSpacing(false);
    
    // Reset bar count to default
    setBarCount(1);
    
    // Reset bay spacing to default
    setBaySpacing(0);
    
    // Reset dimensions to default values based on mount type
    if (newMountType.includes('wall')) {
      // Keep height input for wall mount types
      setUserHeight(42);
    } else {
      // Reset height for non-wall mount types
      setUserHeight(42);
    }
    
    // Reset width and depth to defaults
    setUserWidth(36);
    setShelfDepth(12);
    setTotalDepth(12);
    
    // Reset pipe diameter to default
    setPipeDiameter('5/8');
  };

  // Determine if all necessary selections have been made
  const isViewerReady = selectedShelf;



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
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
     

      <main className="container mx-auto px-6 py-12">
        <div className="flex flex-col xl:flex-row gap-12">
          {/* Left Column - Configuration Panel */}
          <div className="w-full xl:w-2/5 space-y-6">
            <div className="bg-white border border-gray-300 p-8">
              <h2 className="text-2xl font-light text-gray-900 mb-8 pb-4 border-b border-gray-300">
                Configuration Options
              </h2>
              
              <div className="space-y-8">
                <MountTypeSelector onSelect={setMountType} onMountTypeChange={resetSelections} />
                
                <DimensionInputs
                  key={`dimensions-${mountType}`}
                  height={userHeight}
                  width={userWidth}
                  shelfDepth={shelfDepth}
                  totalDepth={totalDepth}
                  unit={unit}
                  selectedDepthType={selectedDepthType}
                  onHeightChange={setUserHeight}
                  onWidthChange={setUserWidth}
                  onShelfDepthChange={handleShelfDepthChange}
                  onTotalDepthChange={handleTotalDepthChange}
                  onDepthTypeChange={handleDepthTypeChange}
                  onUnitChange={setUnit}
                />

                <ShelfQuantitySelector key={`shelf-quantity-${mountType}`} onSelect={setShelfQuantity} />
                
                <WallConnectionSelector 
                  key={`wall-connection-${mountType}-${shelfQuantity}`}
                  onSelect={setWallConnectionPoint}
                  mountType={mountType}
                  shelfQuantity={shelfQuantity}
                />

                <BackVerticalSelector 
                  key={`back-vertical-${mountType}`}
                  mountType={mountType}
                  backVertical={backVertical}
                  onChange={setBackVertical}
                />
                
                {/* Spacing Mode Toggle */}
                <div className="bg-white p-6 border border-gray-300">
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Shelf Spacing Mode</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setUseIndividualSpacing(false)}
                      className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                        !useIndividualSpacing
                          ? 'bg-black text-white'
                          : 'bg-white text-slate-800 border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      Equal Spacing
                    </button>
                    <button
                      onClick={() => setUseIndividualSpacing(true)}
                      className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                        useIndividualSpacing
                          ? 'bg-black text-white'
                          : 'bg-white text-slate-800 border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      Individual Spacing
                    </button>
                  </div>
                </div>

                {/* Conditional Spacing Selector */}
                {!useIndividualSpacing ? (
                  <ShelfSpacingSelector key={`shelf-spacing-${mountType}`} onSelect={setShelfSpacing} />
                ) : (
                  <IndividualShelfSpacingSelector 
                    key={`individual-spacing-${mountType}`}
                    shelfQuantity={shelfQuantity}
                    onSpacingChange={handleIndividualSpacingChange}
                    defaultSpacing={shelfSpacing}
                  />
                )}
                
                <BarSelector key={`bar-selector-${mountType}`} onSelect={setBarCount} />
                
                <BaySpacingInput 
                  key={`bay-spacing-${mountType}`}
                  baySpacings={baySpacings}
                  onBaySpacingsChange={setBaySpacings}
                  barCount={barCount}
                  totalWidth={userWidth}
                  unit={unit}
                />
                
                <PipeDiameterSelector
                  key={`pipe-diameter-${mountType}`}
                  pipeDiameter={pipeDiameter}
                  onChange={setPipeDiameter}
                />

                {/* Hidden ShelfSelector for logic */}
                <ShelfSelector 
                  key={`shelf-selector-${mountType}`}
                  onSelect={setSelectedShelf} 
                  shelfMaterial="glass"
                />
                


                <CrossbarSelector
                  key={`crossbar-${mountType}`}
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

                <div className="bg-white p-6 border border-gray-300">
                  <UseTopShelfSelector
                    key={`use-top-shelf-${mountType}`}
                    mountType={mountType}
                    useTopShelf={useTopShelf}
                    onChange={setUseTopShelf}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 3D Viewer and Actions */}
          <div className="w-full xl:w-3/5 space-y-6">
            {/* 3D Viewer */}
            <div className="bg-white border border-gray-300">
              <div className="p-6 border-b border-gray-300">
                <h2 className="text-2xl font-light text-gray-900">3D Preview</h2>
                <p className="text-slate-600 mt-1">See your custom configuration in real-time</p>
              </div>
              
              {isLoading ? (
                <div className="w-full h-[500px] flex items-center justify-center p-8 bg-gray-50">
                  <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium text-slate-700 mb-2">
                      Loading 3D Model...
                    </h3>
                    <p className="text-slate-500">
                      Please wait while we prepare your preview
                    </p>
                  </div>
                </div>
              ) : isViewerReady ? (
                <div className="w-full h-[500px]">
                  {areValuesValid() ? (
                    <ThreeDViewer
                      ref={viewerRef}
                      shelfUrl={selectedShelf}
                      shelfQuantity={shelfQuantity}
                      shelfSpacing={!useIndividualSpacing ? shelfSpacing : (shelfSpacings[0] || 250)}
                      shelfSpacings={useIndividualSpacing && shelfSpacings.length > 0 ? shelfSpacings : undefined}
                      mountType={mountType}
                      barCount={barCount}
                      baySpacing={baySpacings.length > 0 ? baySpacings[0] : baySpacing} // Use first bay spacing or legacy value
                      baySpacings={baySpacings}
                      showCrossbars={frontBars || backBars}
                      userHeight={unit === 'inch' ? userHeight * 25.4 : userHeight}
                      userWidth={unit === 'inch' ? userWidth * 25.4 : userWidth}
                      shelfDepth={unit === 'inch' ? shelfDepth * 25.4 : shelfDepth}
                      useTopShelf={useTopShelf}
                      pipeDiameter={pipeDiameter}
                      frontBars={frontBars}
                      backBars={backBars}
                      verticalBarsAtBack={verticalBarsAtBack}
                      wallConnectionPoint={wallConnectionPoint}
                      selectedShelvesForBars={selectedShelvesForBars}
                      selectedBackShelvesForBars={selectedShelvesForBackBars}
                      backVertical={backVertical}
                    />
                  ) : (
                    <div className="w-full h-[500px] flex items-center justify-center p-8 bg-gray-50">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-slate-700 mb-2">
                          Invalid Configuration
                        </h3>
                        <p className="text-slate-500 text-sm max-w-md mx-auto">
                          {getValidationMessage()}
                        </p>
                        <p className="text-slate-400 text-xs mt-3">
                          Please adjust the values to see the 3D preview
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-[500px] flex items-center justify-center p-8 bg-gray-50">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-700 mb-2">
                      Configuration Preview
                    </h3>
                    <p className="text-slate-500">
                      Your custom shelf will appear here
                    </p>
                  </div>
                </div>
              )}
              
              {/* Show Dimensions Button */}
              <div className="p-6 border-t border-gray-300">
                <button 
                  onClick={async () => {
                    if (viewerRef.current) {
                      const imgs = await viewerRef.current.captureViews();
                      setShots(imgs);
                    }
                    setIsDimensionsOpen(true);
                  }}
                  className="w-full py-3 px-4 text-gray-800 font-medium hover:bg-gray-100 transition-colors border border-gray-300"
                >
                  Show Dimensions & Views
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
        baySpacingMm={baySpacings.length > 0 ? baySpacings[0] : baySpacing}
        baySpacingsMm={baySpacings}
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
