import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Spinner } from './ui'

const OUTPUT_SIZE = 480

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.crossOrigin = 'anonymous'
    img.src = url
  })
}

async function getCroppedBlob(imageSrc, cropPixels) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE
  const ctx = canvas.getContext('2d')

  ctx.drawImage(
    image,
    cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height,
    0, 0, OUTPUT_SIZE, OUTPUT_SIZE
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92)
  })
}

export default function ImageCropModal({ file, onCancel, onCropped }) {
  const [imgSrc] = useState(() => URL.createObjectURL(file))
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [saving, setSaving] = useState(false)

  const onCropComplete = useCallback((_area, pixels) => {
    setCroppedAreaPixels(pixels)
  }, [])

  async function handleApply() {
    if (!croppedAreaPixels) return
    setSaving(true)
    const blob = await getCroppedBlob(imgSrc, croppedAreaPixels)
    setSaving(false)
    if (blob) onCropped(blob)
  }

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-sm shadow-modal p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-center">Adjust your photo</h3>

        <div className="relative w-full rounded-lg overflow-hidden bg-slate-900" style={{ height: 320 }}>
          <Cropper
            image={imgSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex items-center gap-3 mt-5">
          <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 accent-brand-500"
          />
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-2">
          Drag to reposition · use the slider to zoom
        </p>

        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleApply} disabled={!croppedAreaPixels || saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving && <Spinner size="sm" />}
            Use photo
          </button>
        </div>
      </div>
    </div>
  )
}
