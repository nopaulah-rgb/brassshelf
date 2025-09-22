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
  
  // State for managing which step is currently open
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [material, setMaterial] = useState<'brass' | 'stainless-steel'>('brass');
  const [finish, setFinish] = useState<'polished' | 'brushed'>('polished');

  // Mark step as completed
  const markStepCompleted = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
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
        pipeDiameter,
        material,
        finish
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
    <div className="group/design-root">
      {/* Header matching reference design */}
      <header className="sticky top-0 z-50 border-b border-[#e6e1db] bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <svg className="h-6 w-6 text-[#181511]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
              <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
            <h1 className="text-xl font-bold tracking-tight">Brass & Co</h1>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <button className="text-sm font-medium hover:text-[#ec9513]">Shop</button>
            <button className="text-sm font-medium hover:text-[#ec9513]">New</button>
            <button className="text-sm font-medium hover:text-[#ec9513]">Sale</button>
            <button className="text-sm font-medium hover:text-[#ec9513]">About</button>
          </nav>
          <div className="flex items-center gap-2">
            <button className="hidden rounded-md bg-[#f4f3f0] p-2.5 text-[#181511] hover:bg-[#e6e1db] sm:block">
              <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
            </button>
            <button className="hidden rounded-md bg-[#f4f3f0] p-2.5 text-[#181511] hover:bg-[#e6e1db] sm:block">
              <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
                <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
              </svg>
            </button>
            <button className="rounded-md bg-[#f4f3f0] p-2.5 text-[#181511] hover:bg-[#e6e1db]">
              <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
                <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM176,88a48,48,0,0,1-96,0,8,8,0,0,1,16,0,32,32,0,0,0,64,0,8,8,0,0,1,16,0Z"></path>
              </svg>
            </button>
            <button className="rounded-md p-2.5 text-[#181511] hover:bg-[#e6e1db] md:hidden">
              <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] lg:gap-16">
          {/* Left Column - Configurator */}
          <div className="lg:max-h-[calc(100vh-81px)] lg:overflow-y-auto lg:py-8 lg:pr-8">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Configure your shelving unit</h2>
                <p className="text-lg text-[#897961]">Customize every detail to fit your space and style perfectly.</p>
              </div>
              
              <div className="space-y-1" id="configurator-steps">
                {/* Step 1: Mounting Type */}
                <div className={`step ${completedSteps.includes(1) ? 'completed-step' : ''} ${currentStep === 1 ? 'active-step' : ''}`} data-step="1">
                  <details open={currentStep === 1}>
                    <summary 
                      className="flex cursor-pointer list-none items-center justify-between py-4 text-lg font-bold"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentStep(currentStep === 1 ? 0 : 1);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setCurrentStep(currentStep === 1 ? 0 : 1);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                          completedSteps.includes(1) 
                            ? 'border-[#ec9513] bg-[#ec9513] text-white'
                            : currentStep === 1
                              ? 'border-[#ec9513] bg-[#ec9513] text-white'
                              : 'border-gray-300 bg-white text-gray-500'
                        }`}>
                          {completedSteps.includes(1) ? (
                            <svg className="h-4 w-4 checkmark" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="16">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          ) : (
                            <span>1</span>
                          )}
                        </div>
                        <span className={`step-title ${currentStep === 1 || completedSteps.includes(1) ? '' : 'text-gray-500'}`}>Mounting Type</span>
                      </div>
                      <svg className={`chevron h-5 w-5 transition-transform duration-300 ${currentStep === 1 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="m19.5 8.25-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </summary>
                    {currentStep === 1 && (
                      <div className="ml-12 border-l-2 border-gray-200 pl-6 pb-6">
                        <div className="pt-4">
                          <MountTypeSelector 
                            onSelect={(type) => {
                              setMountType(type);
                              markStepCompleted(1);
                              setCurrentStep(2);
                            }} 
                            onMountTypeChange={resetSelections} 
                          />
                        </div>
                      </div>
                    )}
                  </details>
                </div>

                {/* Step 2: Dimensions */}
                <div className={`step ${completedSteps.includes(2) ? 'completed-step' : ''} ${currentStep === 2 ? 'active-step' : ''}`} data-step="2">
                  <details open={currentStep === 2}>
                    <summary 
                      className="flex cursor-pointer list-none items-center justify-between py-4 text-lg font-bold"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentStep(currentStep === 2 ? 0 : 2);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setCurrentStep(currentStep === 2 ? 0 : 2);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                          completedSteps.includes(2) 
                            ? 'border-[#ec9513] bg-[#ec9513] text-white'
                            : currentStep === 2
                              ? 'border-[#ec9513] bg-[#ec9513] text-white'
                              : 'border-gray-300 bg-white text-gray-500'
                        }`}>
                          {completedSteps.includes(2) ? (
                            <svg className="h-4 w-4 checkmark" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="16">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          ) : (
                            <span>2</span>
                          )}
                        </div>
                        <span className={`step-title ${currentStep === 2 || completedSteps.includes(2) ? '' : 'text-gray-500'}`}>Dimensions</span>
                      </div>
                      <svg className={`chevron h-5 w-5 transition-transform duration-300 ${currentStep === 2 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="m19.5 8.25-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </summary>
                    {currentStep === 2 && (
                      <div className="ml-12 border-l-2 border-gray-200 pl-6 pb-6">
                        <div className="pt-4">
                <DimensionInputs
                  key={`dimensions-${mountType}`}
                  height={userHeight}
                  width={userWidth}
                  shelfDepth={shelfDepth}
                  totalDepth={totalDepth}
                  unit={unit}
                  selectedDepthType={selectedDepthType}
                            onHeightChange={(height) => {
                              setUserHeight(height);
                              markStepCompleted(2);
                            }}
                            onWidthChange={(width) => {
                              setUserWidth(width);
                              markStepCompleted(2);
                            }}
                  onShelfDepthChange={handleShelfDepthChange}
                  onTotalDepthChange={handleTotalDepthChange}
                  onDepthTypeChange={handleDepthTypeChange}
                  onUnitChange={setUnit}
                />
                        </div>
                      </div>
                    )}
                  </details>
                </div>

                {/* Step 3: Shelf Layout */}
                <div className={`step ${completedSteps.includes(3) ? 'completed-step' : ''} ${currentStep === 3 ? 'active-step' : ''}`} data-step="3">
                  <details open={currentStep === 3}>
                    <summary 
                      className="flex cursor-pointer list-none items-center justify-between py-4 text-lg font-bold"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentStep(currentStep === 3 ? 0 : 3);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setCurrentStep(currentStep === 3 ? 0 : 3);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                          completedSteps.includes(3) 
                            ? 'border-[#ec9513] bg-[#ec9513] text-white'
                            : currentStep === 3
                              ? 'border-[#ec9513] bg-[#ec9513] text-white'
                              : 'border-gray-300 bg-white text-gray-500'
                        }`}>
                          {completedSteps.includes(3) ? (
                            <svg className="h-4 w-4 checkmark" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="16">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          ) : (
                            <span>3</span>
                          )}
                        </div>
                        <span className={`step-title ${currentStep === 3 || completedSteps.includes(3) ? '' : 'text-gray-500'}`}>Shelf Layout</span>
                      </div>
                      <svg className={`chevron h-5 w-5 transition-transform duration-300 ${currentStep === 3 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="m19.5 8.25-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </summary>
                    {currentStep === 3 && (
                      <div className="ml-12 border-l-2 border-gray-200 pl-6 pb-6">
                        <div className="space-y-6 pt-4">
                          <ShelfQuantitySelector 
                            key={`shelf-quantity-${mountType}`} 
                            onSelect={(quantity) => {
                              setShelfQuantity(quantity);
                              markStepCompleted(3);
                            }} 
                          />
                          
                          <BarSelector 
                            key={`bar-selector-${mountType}`} 
                            onSelect={(count) => {
                              setBarCount(count);
                              markStepCompleted(3);
                            }} 
                          />
                          
                          <BaySpacingInput 
                            key={`bay-spacing-${mountType}`}
                            baySpacings={baySpacings}
                            onBaySpacingsChange={setBaySpacings}
                            barCount={barCount}
                            totalWidth={userWidth}
                            unit={unit}
                />
                
                {/* Spacing Mode Toggle */}
                          <div>
                            <label className="mb-2 block text-sm font-medium">Shelf Spacing Mode</label>
                            <div className="flex gap-4">
                              <label className={`radio-label ${!useIndividualSpacing ? 'active' : ''}`}>
                                <input 
                                  className="sr-only" 
                                  name="spacing-mode" 
                                  type="radio" 
                                  value="equal" 
                                  checked={!useIndividualSpacing}
                                  onChange={() => setUseIndividualSpacing(false)}
                                />
                      Equal Spacing
                              </label>
                              <label className={`radio-label ${useIndividualSpacing ? 'active' : ''}`}>
                                <input 
                                  className="sr-only" 
                                  name="spacing-mode" 
                                  type="radio" 
                                  value="individual" 
                                  checked={useIndividualSpacing}
                                  onChange={() => setUseIndividualSpacing(true)}
                                />
                      Individual Spacing
                              </label>
                  </div>
                </div>

                {/* Conditional Spacing Selector */}
                {!useIndividualSpacing ? (
                            <ShelfSpacingSelector 
                              key={`shelf-spacing-${mountType}`} 
                              onSelect={(spacing) => {
                                setShelfSpacing(spacing);
                                markStepCompleted(3);
                              }} 
                            />
                ) : (
                  <IndividualShelfSpacingSelector 
                    key={`individual-spacing-${mountType}`}
                    shelfQuantity={shelfQuantity}
                    onSpacingChange={handleIndividualSpacingChange}
                    defaultSpacing={shelfSpacing}
                  />
                )}
                
                          <WallConnectionSelector 
                            key={`wall-connection-${mountType}-${shelfQuantity}`}
                            onSelect={(points) => {
                              setWallConnectionPoint(points);
                              markStepCompleted(3);
                            }}
                            mountType={mountType}
                            shelfQuantity={shelfQuantity}
                          />

                          <BackVerticalSelector 
                            key={`back-vertical-${mountType}`}
                            mountType={mountType}
                            backVertical={backVertical}
                            onChange={(vertical) => {
                              setBackVertical(vertical);
                              markStepCompleted(3);
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </details>
                </div>

                {/* Step 4: Pipes & Crossbars */}
                <div className={`step ${completedSteps.includes(4) ? 'completed-step' : ''} ${currentStep === 4 ? 'active-step' : ''}`} data-step="4">
                  <details open={currentStep === 4}>
                    <summary 
                      className="flex cursor-pointer list-none items-center justify-between py-4 text-lg font-bold"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentStep(currentStep === 4 ? 0 : 4);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setCurrentStep(currentStep === 4 ? 0 : 4);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                          completedSteps.includes(4) 
                            ? 'border-[#ec9513] bg-[#ec9513] text-white'
                            : currentStep === 4
                              ? 'border-[#ec9513] bg-[#ec9513] text-white'
                              : 'border-gray-300 bg-white text-gray-500'
                        }`}>
                          {completedSteps.includes(4) ? (
                            <svg className="h-4 w-4 checkmark" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="16">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          ) : (
                            <span>4</span>
                          )}
                        </div>
                        <span className={`step-title ${currentStep === 4 || completedSteps.includes(4) ? '' : 'text-gray-500'}`}>Pipe & Crossbar</span>
                      </div>
                      <svg className={`chevron h-5 w-5 transition-transform duration-300 ${currentStep === 4 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="m19.5 8.25-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </summary>
                    {currentStep === 4 && (
                      <div className="ml-12 border-l-2 border-gray-200 pl-6 pb-6">
                        <div className="space-y-6 pt-4">
                <PipeDiameterSelector
                  key={`pipe-diameter-${mountType}`}
                  pipeDiameter={pipeDiameter}
                            onChange={(diameter) => {
                              setPipeDiameter(diameter);
                              markStepCompleted(4);
                            }}
                          />

                <CrossbarSelector
                  key={`crossbar-${mountType}`}
                  frontBars={frontBars}
                            onFrontBarsChange={(enabled) => {
                              setFrontBars(enabled);
                              markStepCompleted(4);
                            }}
                  backBars={backBars}
                            onBackBarsChange={(enabled) => {
                              setBackBars(enabled);
                              markStepCompleted(4);
                            }}
                  mountType={mountType}
                  shelfCount={shelfQuantity}
                  selectedShelves={selectedShelvesForBars}
                  onSelectedShelvesChange={setSelectedShelvesForBars}
                  selectedBackShelves={selectedShelvesForBackBars}
                  onSelectedBackShelvesChange={setSelectedShelvesForBackBars}
                />
                        </div>
                      </div>
                    )}
                  </details>
                </div>

                {/* Step 5: Material & Finish */}
                <div className={`step ${completedSteps.includes(5) ? 'completed-step' : ''} ${currentStep === 5 ? 'active-step' : ''}`} data-step="5">
                  <details open={currentStep === 5}>
                    <summary 
                      className="flex cursor-pointer list-none items-center justify-between py-4 text-lg font-bold"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentStep(currentStep === 5 ? 0 : 5);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setCurrentStep(currentStep === 5 ? 0 : 5);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                          completedSteps.includes(5) 
                            ? 'border-[#ec9513] bg-[#ec9513] text-white'
                            : currentStep === 5
                              ? 'border-[#ec9513] bg-[#ec9513] text-white'
                              : 'border-gray-300 bg-white text-gray-500'
                        }`}>
                          {completedSteps.includes(5) ? (
                            <svg className="h-4 w-4 checkmark" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="16">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          ) : (
                            <span>5</span>
                          )}
                        </div>
                        <span className={`step-title ${currentStep === 5 || completedSteps.includes(5) ? '' : 'text-gray-500'}`}>Finish & Summary</span>
                      </div>
                      <svg className={`chevron h-5 w-5 transition-transform duration-300 ${currentStep === 5 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="m19.5 8.25-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </summary>
                    {currentStep === 5 && (
                      <div className="ml-12 border-l-2 border-gray-200 pl-6 pb-6">
                        <div className="space-y-6 pt-4">
                          <div>
                            <label className="mb-2 block text-sm font-medium">Material</label>
                            <div className="flex flex-wrap gap-4">
                              <label className={`radio-label ${material === 'brass' ? 'active' : ''}`}>
                                <input 
                                  className="sr-only" 
                                  name="material" 
                                  type="radio" 
                                  value="brass" 
                                  checked={material === 'brass'}
                                  onChange={() => {
                                    setMaterial('brass');
                                    markStepCompleted(5);
                                  }}
                                />
                                Brass
                              </label>
                              <label className={`radio-label ${material === 'stainless-steel' ? 'active' : ''}`}>
                                <input 
                                  className="sr-only" 
                                  name="material" 
                                  type="radio" 
                                  value="stainless-steel" 
                                  checked={material === 'stainless-steel'}
                                  onChange={() => {
                                    setMaterial('stainless-steel');
                                    markStepCompleted(5);
                                  }}
                                />
                                Stainless Steel
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium">Finish</label>
                            <div className="flex flex-wrap gap-4">
                              <label className={`radio-label ${finish === 'polished' ? 'active' : ''}`}>
                                <input 
                                  className="sr-only" 
                                  name="finish" 
                                  type="radio" 
                                  value="polished" 
                                  checked={finish === 'polished'}
                                  onChange={() => {
                                    setFinish('polished');
                                    markStepCompleted(5);
                                  }}
                                />
                                Polished
                              </label>
                              <label className={`radio-label ${finish === 'brushed' ? 'active' : ''}`}>
                                <input 
                                  className="sr-only" 
                                  name="finish" 
                                  type="radio" 
                                  value="brushed" 
                                  checked={finish === 'brushed'}
                                  onChange={() => {
                                    setFinish('brushed');
                                    markStepCompleted(5);
                                  }}
                                />
                                Brushed
                              </label>
                            </div>
                          </div>

                  <UseTopShelfSelector
                    key={`use-top-shelf-${mountType}`}
                    mountType={mountType}
                    useTopShelf={useTopShelf}
                            onChange={(useTop) => {
                              setUseTopShelf(useTop);
                              markStepCompleted(5);
                            }}
                  />
            </div>
          </div>
                    )}
                  </details>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 3D Viewer */}
          <div className="sticky top-[81px] h-[calc(100vh-81px)] py-8">
            <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#f4f3f0]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-b-2 border-[#ec9513] mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium text-[#181511] mb-2">Loading 3D Model...</h3>
                    <p className="text-[#897961]">Please wait while we prepare your preview</p>
                  </div>
                </div>
              ) : isViewerReady ? (
                <>
                  {areValuesValid() ? (
                    <ThreeDViewer
                      ref={viewerRef}
                      shelfUrl={selectedShelf}
                      shelfQuantity={shelfQuantity}
                      shelfSpacing={!useIndividualSpacing ? shelfSpacing : (shelfSpacings[0] || 250)}
                      shelfSpacings={useIndividualSpacing && shelfSpacings.length > 0 ? shelfSpacings : undefined}
                      mountType={mountType}
                      barCount={barCount}
                      baySpacing={baySpacings.length > 0 ? (baySpacings.every(spacing => spacing === 0) ? 0 : baySpacings[0]) : baySpacing}
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
                      price={price}
                      onSave={() => {/* Save functionality */}}
                      onLoad={() => {/* Load functionality */}}
                      onExport={handleExport}
                      onReset={() => {/* Reset functionality */}}
                      onAddToCart={handleAddToCart}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-8">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 flex items-center justify-center mx-auto mb-4 rounded-full">
                          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-[#181511] mb-2">Invalid Configuration</h3>
                        <p className="text-[#897961] text-sm max-w-md mx-auto">{getValidationMessage()}</p>
                      </div>
                    </div>
                  )}
                  
              
                </>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-[#181511] mb-2">Configuration Preview</h3>
                    <p className="text-[#897961]">Your custom shelf will appear here</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Hidden components for logic */}
      <div className="hidden">
        <ShelfSelector onSelect={setSelectedShelf} shelfMaterial="glass" />
      </div>

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
        baySpacingMm={baySpacings.length > 0 ? (baySpacings.every(spacing => spacing === 0) ? 0 : baySpacings[0]) : baySpacing}
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
