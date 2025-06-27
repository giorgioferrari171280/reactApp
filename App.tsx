import React, { useState, useEffect, useCallback } from 'react';
import type { GameState } from './types';
import { getInitialGameState, getGameStateAfterItemUse, getGameStateAfterAction } from './services/storyService';
import Spinner from './components/Spinner';
import { Home, Settings, Package, BookOpen } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true); // For initial game state load
  const [error, setError] = useState<string | null>(null);

  const [imageError, setImageError] = useState<boolean>(false);
  const [isUiDisabled, setIsUiDisabled] = useState<boolean>(false);

  const fetchGameData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getInitialGameState();
      setGameState(data);
      if (data.inventory && data.inventory.length > 0) {
        setSelectedItem(data.inventory[0]);
      } else {
        setSelectedItem('');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(message);
      console.error(err);
      setGameState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGameData();
  }, [fetchGameData]);
  
  useEffect(() => {
    if (gameState) {
        setImageError(false);
    }
  }, [gameState?.locationId]);


  const handleActionClick = useCallback(async (action: string) => {
    if (!gameState || isUiDisabled) return;

    setError(null);
    setIsUiDisabled(true);
    try {
      const data = await getGameStateAfterAction(action, gameState);
      setGameState(data);
      setSelectedItem(data.inventory?.[0] || '');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(message);
      console.error(err);
    } finally {
        setIsUiDisabled(false);
    }
  }, [gameState, isUiDisabled]);

  const handleUseItem = useCallback(async () => {
    if (!selectedItem || !gameState || isUiDisabled) return;

    setError(null);
    setIsUiDisabled(true);
    try {
      const data = await getGameStateAfterItemUse(selectedItem, gameState);
      setGameState(data);
      setSelectedItem(data.inventory?.[0] || '');
    } catch (err) {
       const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(message);
      console.error(err);
    } finally {
        setIsUiDisabled(false);
    }
  }, [selectedItem, gameState, isUiDisabled]);

  const renderContent = () => {
    if (isLoading && !gameState) { // Show initial spinner only when no data is present
      return (
        <div className="flex items-center justify-center h-full text-ddr-text-light">
          <Spinner />
        </div>
      );
    }

    if (error && !gameState) {
      return (
        <div className="p-8 text-red-400 font-bold">
          <h2 className="text-2xl mb-4">SYSTEM ERROR</h2>
          <p>{error}</p>
        </div>
      );
    }

    if (!gameState) {
      return (
        <div className="p-8 text-ddr-text">
          <p>No game data available. Please try refreshing the application.</p>
        </div>
      );
    }

    return (
      <div className="absolute inset-0 p-2 sm:p-4 md:p-6 flex flex-col">
        <div className="flex-1 min-h-0 mb-4 bg-ddr-dark border border-ddr-border overflow-hidden">
          <div className="h-full overflow-y-auto p-4">
            <p className="text-ddr-text whitespace-pre-wrap leading-relaxed">
              {gameState.narrative}
            </p>
             {error && <p className="mt-4 text-red-400 font-bold">{error}</p>}
          </div>
        </div>

        {gameState.inventory && gameState.inventory.length > 0 && (
            <div className="flex-shrink-0 flex items-stretch gap-3 mb-4">
                 <select
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    disabled={isUiDisabled}
                    className="flex-grow bg-ddr-dark border border-ddr-border text-ddr-text p-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ddr-panel focus:ring-ddr-green"
                    aria-label="Select an item from your inventory"
                    >
                    {gameState.inventory.map((item, index) => (
                        <option key={`${index}-${item}`} value={item}>
                        {item}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleUseItem}
                    disabled={!selectedItem || isUiDisabled}
                    className="flex-shrink-0 bg-ddr-green text-ddr-text-light px-6 py-3 uppercase font-bold text-sm tracking-wider border-b-4 border-ddr-dark hover:bg-ddr-green-hover disabled:bg-ddr-border disabled:text-ddr-text disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ddr-panel focus:ring-ddr-text"
                >
                    USE
                </button>
            </div>
        )}
        
        <div className="flex-shrink-0 flex gap-3">
          <div className="flex-grow grid grid-cols-1 gap-3">
            {gameState.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleActionClick(action)}
                disabled={isUiDisabled}
                className="w-full bg-ddr-green text-ddr-text-light p-3 text-left text-sm uppercase tracking-wider font-bold border-b-4 border-ddr-dark hover:bg-ddr-green-hover transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ddr-panel focus:ring-ddr-text disabled:bg-ddr-border disabled:text-ddr-text disabled:cursor-not-allowed"
              >
                &gt; {action}
              </button>
            ))}
          </div>

          <div className="flex-shrink-0 flex flex-col gap-2 justify-between">
            <button disabled={isUiDisabled} className="aspect-square w-14 bg-ddr-panel border-2 border-ddr-border text-ddr-text-light hover:bg-ddr-border hover:text-white transition-colors duration-200 flex items-center justify-center group p-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Home size={20} className="group-hover:scale-110 transition-transform duration-200" />
            </button>
            <button disabled={isUiDisabled} className="aspect-square w-14 bg-ddr-panel border-2 border-ddr-border text-ddr-text-light hover:bg-ddr-border hover:text-white transition-colors duration-200 flex items-center justify-center group p-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Settings size={20} className="group-hover:scale-110 transition-transform duration-200" />
            </button>
            <button disabled={isUiDisabled} className="aspect-square w-14 bg-ddr-panel border-2 border-ddr-border text-ddr-text-light hover:bg-ddr-border hover:text-white transition-colors duration-200 flex items-center justify-center group p-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Package size={20} className="group-hover:scale-110 transition-transform duration-200" />
            </button>
            <button disabled={isUiDisabled} className="aspect-square w-14 bg-ddr-panel border-2 border-ddr-border text-ddr-text-light hover:bg-ddr-border hover:text-white transition-colors duration-200 flex items-center justify-center group p-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <BookOpen size={20} className="group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="bg-ddr-dark min-h-screen text-ddr-text-light font-mono flex items-center justify-center p-4">
      <div className="w-full max-w-7xl mx-auto shadow-2xl border-4 border-ddr-border grid grid-cols-1 md:grid-cols-2 bg-ddr-panel h-[90vh] max-h-[800px] overflow-hidden">
        <div className="relative h-full bg-ddr-dark flex items-center justify-center text-ddr-text-light overflow-hidden">
          {isLoading || !gameState ? (
            <Spinner />
          ) : imageError ? (
            <div className="p-4 text-center">
              <p>IMAGE NOT FOUND</p>
              <p className="text-xs text-ddr-text mt-1">Could not load {gameState.imageUrl}</p>
            </div>
          ) : (
            <img
              key={gameState.imageUrl}
              src={gameState.imageUrl}
              alt={`An atmospheric view of ${gameState.locationName}.`}
              className="w-full h-full object-cover animate-fade-in"
              onError={() => setImageError(true)}
            />
          )}
        </div>
        <div className="relative h-full">
          {renderContent()}
        </div>
      </div>
    </main>
  );
}