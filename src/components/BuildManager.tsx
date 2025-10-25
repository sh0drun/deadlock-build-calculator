import { useState, useEffect, useCallback, memo } from 'react';
import type { Hero, Item } from '../types';
import { BuildStorage, type SavedBuild } from '../services/buildStorage';

interface BuildManagerProps {
  selectedHero: Hero | null;
  selectedItems: Item[];
  onLoadBuild: (heroId: number, itemIds: number[]) => void;
}

export const BuildManager = memo(function BuildManager({ selectedHero, selectedItems, onLoadBuild }: BuildManagerProps) {
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [buildName, setBuildName] = useState('');
  const [shareURL, setShareURL] = useState('');

  const loadBuilds = useCallback(() => {
    setSavedBuilds(BuildStorage.getAllBuilds());
  }, []);

  useEffect(() => {
    loadBuilds();
  }, [loadBuilds]);

  const handleSave = useCallback(() => {
    if (!selectedHero || !buildName.trim()) return;

    BuildStorage.saveBuild(buildName, selectedHero, selectedItems);
    setBuildName('');
    setShowSaveDialog(false);
    loadBuilds();
  }, [selectedHero, buildName, selectedItems, loadBuilds]);

  const handleLoad = useCallback((build: SavedBuild) => {
    onLoadBuild(build.heroId, build.itemIds);
    setShowLoadDialog(false);
  }, [onLoadBuild]);

  const handleDelete = useCallback((id: string) => {
    if (confirm('Are you sure you want to delete this build?')) {
      BuildStorage.deleteBuild(id);
      loadBuilds();
    }
  }, [loadBuilds]);

  const handleShare = useCallback(() => {
    if (!selectedHero) return;

    const encoded = BuildStorage.encodeBuildToURL(
      selectedHero.id,
      selectedItems.map(item => item.id)
    );
    const url = `${window.location.origin}${window.location.pathname}?build=${encoded}`;
    setShareURL(url);
    setShowShareDialog(true);
  }, [selectedHero, selectedItems]);

  const handleCopyURL = useCallback(() => {
    navigator.clipboard.writeText(shareURL);
    alert('Build URL copied to clipboard!');
  }, [shareURL]);

  const handleExport = useCallback((build: SavedBuild) => {
    const json = BuildStorage.exportBuildToJSON(build);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${build.name.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const json = event.target?.result as string;
        const build = BuildStorage.importBuildFromJSON(json);
        if (build) {
          loadBuilds();
          onLoadBuild(build.heroId, build.itemIds);
          alert(`Build "${build.name}" imported and loaded successfully!`);
        } else {
          alert('Failed to import build. Invalid file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [loadBuilds, onLoadBuild]);

  return (
    <div className="build-manager">
      <div className="build-actions">
        <button
          className="action-button"
          onClick={() => setShowSaveDialog(true)}
          disabled={!selectedHero}
        >
          Save Build
        </button>
        <button className="action-button" onClick={() => setShowLoadDialog(true)}>
          Load Build
        </button>
        <button
          className="action-button"
          onClick={handleShare}
          disabled={!selectedHero}
        >
          Share Build
        </button>
        <button className="action-button" onClick={handleImport}>
          Import
        </button>
      </div>

      {showSaveDialog && (
        <div className="dialog-overlay" onClick={() => setShowSaveDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Save Build</h3>
            <input
              type="text"
              placeholder="Build name..."
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
              className="build-name-input"
              autoFocus
            />
            <div className="dialog-actions">
              <button onClick={handleSave} disabled={!buildName.trim()}>
                Save
              </button>
              <button onClick={() => setShowSaveDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showLoadDialog && (
        <div className="dialog-overlay" onClick={() => setShowLoadDialog(false)}>
          <div className="dialog large" onClick={(e) => e.stopPropagation()}>
            <h3>Load Build</h3>
            <div className="builds-list">
              {savedBuilds.length === 0 ? (
                <p className="no-builds">No saved builds yet</p>
              ) : (
                savedBuilds.map((build) => (
                  <div key={build.id} className="build-item">
                    <div className="build-info">
                      <div className="build-name">{build.name}</div>
                      <div className="build-meta">
                        {build.itemIds.length} items - {new Date(build.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="build-actions-inline">
                      <button onClick={() => handleLoad(build)}>Load</button>
                      <button onClick={() => handleExport(build)}>Export</button>
                      <button onClick={() => handleDelete(build.id)} className="delete-btn">
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="dialog-actions">
              <button onClick={() => setShowLoadDialog(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showShareDialog && (
        <div className="dialog-overlay" onClick={() => setShowShareDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Share Build</h3>
            <p>Copy this URL to share your build:</p>
            <div className="share-url-container">
              <input
                type="text"
                value={shareURL}
                readOnly
                className="share-url-input"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button onClick={handleCopyURL}>Copy</button>
            </div>
            <div className="dialog-actions">
              <button onClick={() => setShowShareDialog(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
