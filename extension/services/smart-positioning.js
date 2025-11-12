/**
 * Smart Positioning System
 * Automatically positions UI elements to avoid blocking faces in video
 * Uses face detection and creates "safe zones" for UI placement
 */

export class SmartPositioningSystem {
  constructor() {
    this.videoElements = [];
    this.faces = [];
    this.safeZones = [];
    this.components = new Map(); // Track UI components
    this.detectionInterval = null;
    this.isActive = false;

    // Configuration
    this.config = {
      detectionFrequency: 2000, // Check every 2 seconds
      minSafeZoneSize: 200, // Minimum size for a safe zone
      padding: 20, // Padding around detected faces
      preferredPositions: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
      useSimpleDetection: true // Use simple detection vs ML (for performance)
    };
  }

  /**
   * Initialize positioning system
   */
  async initialize() {
    console.log('🎯 Initializing Smart Positioning System...');

    // Find video elements
    this.findVideoElements();

    // Start detection
    this.startDetection();

    this.isActive = true;
    console.log('✅ Smart Positioning active');
  }

  /**
   * Find all video elements on page
   */
  findVideoElements() {
    const videos = Array.from(document.querySelectorAll('video'));

    this.videoElements = videos.filter(video => {
      // Filter for videos that are actually showing participant faces
      return video.videoWidth > 0 &&
             video.videoHeight > 0 &&
             video.readyState >= 2;
    });

    console.log(`📹 Found ${this.videoElements.length} video elements`);
  }

  /**
   * Start face detection
   */
  startDetection() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }

    // Initial detection
    this.detectFaces();

    // Periodic detection
    this.detectionInterval = setInterval(() => {
      this.detectFaces();
    }, this.config.detectionFrequency);
  }

  /**
   * Stop detection
   */
  stopDetection() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    this.isActive = false;
  }

  /**
   * Detect faces in video elements
   */
  async detectFaces() {
    // Refresh video elements list
    this.findVideoElements();

    if (this.videoElements.length === 0) {
      // No video, use default positioning
      this.useDefaultPositioning();
      return;
    }

    if (this.config.useSimpleDetection) {
      // Simple detection based on video positions
      this.simpleVideoDetection();
    } else {
      // Would use ML face detection here (MediaPipe, TensorFlow.js)
      // For now, fall back to simple detection
      this.simpleVideoDetection();
    }

    // Calculate safe zones
    this.calculateSafeZones();

    // Reposition components
    this.repositionComponents();
  }

  /**
   * Simple video-based detection
   * Assumes faces are in video elements
   */
  simpleVideoDetection() {
    this.faces = this.videoElements.map(video => {
      const rect = video.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        element: video
      };
    });
  }

  /**
   * Advanced face detection using MediaPipe or similar
   * This would be the full implementation
   */
  async advancedFaceDetection() {
    // Placeholder for ML-based face detection
    // Would use: @mediapipe/face_detection or TensorFlow.js
    /*
    const faceDetector = await createFaceDetector();

    for (const video of this.videoElements) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const detections = await faceDetector.detect(canvas);

      detections.forEach(detection => {
        this.faces.push({
          x: detection.box.xMin,
          y: detection.box.yMin,
          width: detection.box.width,
          height: detection.box.height,
          confidence: detection.score
        });
      });
    }
    */
  }

  /**
   * Calculate safe zones (areas without faces)
   */
  calculateSafeZones() {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Define potential zones (corners and edges)
    const potentialZones = [
      // Corners
      {
        id: 'top-left',
        x: 20,
        y: 20,
        width: 400,
        height: 300
      },
      {
        id: 'top-right',
        x: viewport.width - 420,
        y: 20,
        width: 400,
        height: 300
      },
      {
        id: 'bottom-left',
        x: 20,
        y: viewport.height - 320,
        width: 400,
        height: 300
      },
      {
        id: 'bottom-right',
        x: viewport.width - 420,
        y: viewport.height - 320,
        width: 400,
        height: 300
      },
      // Edges
      {
        id: 'top-center',
        x: viewport.width / 2 - 200,
        y: 20,
        width: 400,
        height: 150
      },
      {
        id: 'bottom-center',
        x: viewport.width / 2 - 200,
        y: viewport.height - 170,
        width: 400,
        height: 150
      }
    ];

    // Check each zone for face overlap
    this.safeZones = potentialZones
      .map(zone => ({
        ...zone,
        overlapScore: this.calculateOverlapScore(zone),
        isSafe: this.calculateOverlapScore(zone) < 0.2 // Less than 20% overlap
      }))
      .sort((a, b) => a.overlapScore - b.overlapScore);

    console.log(`✅ Found ${this.safeZones.filter(z => z.isSafe).length} safe zones`);
  }

  /**
   * Calculate how much a zone overlaps with faces
   */
  calculateOverlapScore(zone) {
    if (this.faces.length === 0) return 0;

    let totalOverlap = 0;

    this.faces.forEach(face => {
      // Add padding to face
      const paddedFace = {
        x: face.x - this.config.padding,
        y: face.y - this.config.padding,
        width: face.width + (this.config.padding * 2),
        height: face.height + (this.config.padding * 2)
      };

      const overlap = this.calculateRectangleOverlap(zone, paddedFace);
      totalOverlap += overlap;
    });

    // Return overlap as percentage of zone area
    const zoneArea = zone.width * zone.height;
    return totalOverlap / zoneArea;
  }

  /**
   * Calculate overlap between two rectangles
   */
  calculateRectangleOverlap(rect1, rect2) {
    const x1 = Math.max(rect1.x, rect2.x);
    const y1 = Math.max(rect1.y, rect2.y);
    const x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
    const y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

    if (x2 <= x1 || y2 <= y1) {
      return 0; // No overlap
    }

    return (x2 - x1) * (y2 - y1);
  }

  /**
   * Use default positioning (when no video detected)
   */
  useDefaultPositioning() {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.safeZones = [
      {
        id: 'bottom-right',
        x: viewport.width - 420,
        y: viewport.height - 320,
        width: 400,
        height: 300,
        isSafe: true,
        overlapScore: 0
      },
      {
        id: 'top-right',
        x: viewport.width - 420,
        y: 20,
        width: 400,
        height: 300,
        isSafe: true,
        overlapScore: 0
      }
    ];
  }

  /**
   * Register a UI component for smart positioning
   */
  registerComponent(id, element, options = {}) {
    this.components.set(id, {
      element,
      preferredZone: options.preferredZone || 'bottom-right',
      currentZone: null,
      minWidth: options.minWidth || 300,
      minHeight: options.minHeight || 200,
      priority: options.priority || 1 // Higher priority gets better placement
    });

    // Position immediately
    this.positionComponent(id);
  }

  /**
   * Unregister a component
   */
  unregisterComponent(id) {
    this.components.delete(id);
  }

  /**
   * Position a specific component
   */
  positionComponent(id) {
    const component = this.components.get(id);
    if (!component) return;

    // Find best safe zone for this component
    const bestZone = this.findBestZoneForComponent(component);

    if (bestZone) {
      this.applyPositionToComponent(component.element, bestZone);
      component.currentZone = bestZone.id;
    }
  }

  /**
   * Reposition all registered components
   */
  repositionComponents() {
    // Sort components by priority
    const sortedComponents = Array.from(this.components.entries())
      .sort((a, b) => b[1].priority - a[1].priority);

    // Position each component
    sortedComponents.forEach(([id, component]) => {
      this.positionComponent(id);
    });
  }

  /**
   * Find best zone for a component
   */
  findBestZoneForComponent(component) {
    // Try preferred zone first
    const preferredZone = this.safeZones.find(z =>
      z.id === component.preferredZone && z.isSafe
    );

    if (preferredZone) {
      return preferredZone;
    }

    // Fall back to safest zone that fits
    return this.safeZones.find(z =>
      z.isSafe &&
      z.width >= component.minWidth &&
      z.height >= component.minHeight
    );
  }

  /**
   * Apply position to component with smooth transition
   */
  applyPositionToComponent(element, zone) {
    if (!element) return;

    // Add transition
    element.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

    // Apply position
    element.style.position = 'fixed';
    element.style.left = `${zone.x}px`;
    element.style.top = `${zone.y}px`;
    element.style.zIndex = '999999';

    // Add visual feedback (optional)
    element.dataset.smartPositioned = 'true';
  }

  /**
   * Get positioning debug info
   */
  getDebugInfo() {
    return {
      isActive: this.isActive,
      videoCount: this.videoElements.length,
      faceCount: this.faces.length,
      safeZoneCount: this.safeZones.filter(z => z.isSafe).length,
      registeredComponents: this.components.size,
      safeZones: this.safeZones
    };
  }

  /**
   * Enable debug visualization
   */
  enableDebugVisualization() {
    // Remove old debug overlay
    const oldOverlay = document.getElementById('sc-positioning-debug');
    if (oldOverlay) oldOverlay.remove();

    // Create debug overlay
    const overlay = document.createElement('div');
    overlay.id = 'sc-positioning-debug';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 999998;
    `;

    // Draw detected faces (red boxes)
    this.faces.forEach(face => {
      const faceBox = document.createElement('div');
      faceBox.style.cssText = `
        position: absolute;
        left: ${face.x}px;
        top: ${face.y}px;
        width: ${face.width}px;
        height: ${face.height}px;
        border: 3px solid red;
        background: rgba(255, 0, 0, 0.1);
      `;
      overlay.appendChild(faceBox);
    });

    // Draw safe zones (green boxes)
    this.safeZones.filter(z => z.isSafe).forEach(zone => {
      const zoneBox = document.createElement('div');
      zoneBox.style.cssText = `
        position: absolute;
        left: ${zone.x}px;
        top: ${zone.y}px;
        width: ${zone.width}px;
        height: ${zone.height}px;
        border: 2px solid green;
        background: rgba(0, 255, 0, 0.05);
      `;

      const label = document.createElement('div');
      label.style.cssText = `
        position: absolute;
        top: 5px;
        left: 5px;
        background: rgba(0, 255, 0, 0.8);
        color: black;
        padding: 4px 8px;
        font-size: 12px;
        font-weight: bold;
        border-radius: 4px;
      `;
      label.textContent = `${zone.id} (${Math.round((1 - zone.overlapScore) * 100)}% safe)`;
      zoneBox.appendChild(label);

      overlay.appendChild(zoneBox);
    });

    document.body.appendChild(overlay);

    // Auto-remove after 5 seconds
    setTimeout(() => overlay.remove(), 5000);
  }

  /**
   * Disable debug visualization
   */
  disableDebugVisualization() {
    const overlay = document.getElementById('sc-positioning-debug');
    if (overlay) overlay.remove();
  }

  /**
   * Destroy positioning system
   */
  destroy() {
    this.stopDetection();
    this.components.clear();
    this.faces = [];
    this.safeZones = [];
  }
}

/**
 * Simple utility to check if MediaPipe is available
 * For full implementation, would load MediaPipe Face Detection
 */
async function checkFaceDetectionSupport() {
  // Check if running in browser with required APIs
  if (!window.MediaStream || !window.HTMLVideoElement) {
    return {
      supported: false,
      reason: 'Browser APIs not available'
    };
  }

  // Check if MediaPipe or TensorFlow.js can be loaded
  // This is a simplified check
  return {
    supported: true,
    method: 'simple', // Would be 'mediapipe' or 'tensorflow' with full impl
    recommendation: 'Simple video-based detection (no ML required)'
  };
}

export { SmartPositioningSystem, checkFaceDetectionSupport };
