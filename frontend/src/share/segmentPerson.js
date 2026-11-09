/*
 * On-device person cut-out using MediaPipe's selfie segmenter.
 * The photo never leaves the browser. The library (and its wasm + model)
 * is loaded lazily the first time a member uses the share card.
 */
const MP_VERSION = '1.2.2'; // keep in sync with @mediapipe/tasks-vision in package.json
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`;
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite';

let segmenterPromise = null;

async function getSegmenter() {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const { FilesetResolver, ImageSegmenter } = await import('@mediapipe/tasks-vision');
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
      const make = (delegate) => ImageSegmenter.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate },
        runningMode: 'IMAGE',
        outputCategoryMask: false,
        outputConfidenceMasks: true,
      });
      try { return await make('GPU'); } catch { return await make('CPU'); }
    })().catch((err) => {
      segmenterPromise = null; // allow retry
      throw err;
    });
  }
  return segmenterPromise;
}

/** Returns a canvas containing only the person (transparent background). */
export async function cutOutPerson(source) {
  const segmenter = await getSegmenter();
  const w = source.width;
  const h = source.height;
  const result = segmenter.segment(source);
  try {
    const mask = result.confidenceMasks[0];
    const mw = mask.width;
    const mh = mask.height;
    const data = mask.getAsFloat32Array();

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = mw;
    maskCanvas.height = mh;
    const mctx = maskCanvas.getContext('2d');
    const img = mctx.createImageData(mw, mh);
    for (let i = 0; i < data.length; i++) {
      // smoothstep for a crisp but soft edge
      const c = Math.min(1, Math.max(0, (data[i] - 0.35) / 0.3));
      img.data[i * 4 + 3] = Math.round(c * c * (3 - 2 * c) * 255);
    }
    mctx.putImageData(img, 0, 0);

    const out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    const octx = out.getContext('2d');
    octx.drawImage(source, 0, 0, w, h);
    octx.globalCompositeOperation = 'destination-in';
    octx.drawImage(maskCanvas, 0, 0, w, h);

    // reject masks with almost no person (bad photo)
    let covered = 0;
    for (let i = 0; i < data.length; i += 16) if (data[i] > 0.5) covered++;
    if (covered / (data.length / 16) < 0.03) return null;
    return out;
  } finally {
    result.close?.();
  }
}
