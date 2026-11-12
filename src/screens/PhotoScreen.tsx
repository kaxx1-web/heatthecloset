import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import figureIcon from '../assets/figma/photo-figure.svg'
import { StepDots } from '../components/onboarding'
import { CHALLENGE_DAYS } from '../data/stats'
import { routeHref } from '../navigation'

type Props = {
  day: number
  onPhoto: (photo: Blob) => void
}

// intro    = the Figma frame: explains the step, camera is off
// starting = waiting for the browser's camera permission
// live     = camera preview showing in the frame
// error    = no camera, or permission was refused
type Mode = 'intro' | 'starting' | 'live' | 'error'

// Figma: "04 Day 1: photo of your outfit"
// Two ways to add a photo: take one with the camera, or upload one.
// Either way, the photo is only kept in memory and is never saved.
export default function PhotoScreen({ day, onPhoto }: Props) {
  const [mode, setMode] = useState<Mode>('intro')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const leftScreen = useRef(false)

  function stopCamera() {
    // Stopping every track turns the camera (and its light) off.
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  // Turn the camera off when the user leaves this screen.
  useEffect(() => {
    leftScreen.current = false
    return () => {
      leftScreen.current = true
      stopCamera()
    }
  }, [])

  // Once the <video> is on screen, connect the camera stream to it.
  useEffect(() => {
    if (mode === 'live' && videoRef.current) videoRef.current.srcObject = streamRef.current
  }, [mode])

  async function openCamera() {
    // getUserMedia only exists on secure pages (https or localhost).
    if (!navigator.mediaDevices?.getUserMedia) {
      setMode('error')
      return
    }
    setMode('starting')
    try {
      // facingMode "environment" = the back camera. `ideal` means "if there
      // is one", so laptops still use their front camera.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      // If the user left while the permission prompt was open, turn it off.
      if (leftScreen.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = stream
      setMode('live')
    } catch {
      // The user said no, or there's no camera.
      setMode('error')
    }
  }

  function closeCamera() {
    stopCamera()
    setMode('intro')
  }

  // Copy the current video frame onto a <canvas>, then turn it into a JPEG.
  function takePhoto() {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return // camera not ready yet
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        stopCamera()
        onPhoto(blob)
      },
      'image/jpeg',
      0.9,
    )
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      stopCamera()
      onPhoto(file) // a File is a kind of Blob
    }
  }

  const shutterLabel = mode === 'live' ? 'Take photo' : 'Open camera'

  return (
    <div className="flex flex-1 flex-col gap-4 bg-night px-6 pt-[52px] pb-6">
      <div className="flex items-center justify-between">
        <StepDots active={2} dark />
        <p className="text-sm leading-[1.4] font-semibold text-ash">
          Day {day} of {CHALLENGE_DAYS}
        </p>
      </div>

      <h1 tabIndex={-1} className="text-[28px] leading-[1.15] font-extrabold text-paper">
        Take a photo of your outfit right now
      </h1>
      <p className="text-[15px] leading-[1.4] text-ash">
        Mirror selfies work. This starts your 30 days.
      </p>

      {/* The viewfinder: the Figma figure until the camera is on. */}
      <div className="relative flex min-h-[300px] flex-1 items-center justify-center overflow-hidden rounded-[22px] border-2 border-dashed border-[#6a6a6a]">
        {mode === 'live' ? (
          <>
            {/* playsInline stops iPhones from opening the video full screen. */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              aria-label="Camera preview"
              className="absolute inset-0 size-full object-cover"
            />
            <button
              type="button"
              onClick={closeCamera}
              className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full bg-black/60 text-xl text-paper"
            >
              <span aria-hidden="true">✕</span>
              <span className="sr-only">Close camera</span>
            </button>
          </>
        ) : mode === 'error' ? (
          <p role="alert" className="max-w-[260px] text-center text-[15px] leading-[1.4] text-paper">
            We couldn’t open your camera. Check that this site is allowed to use it, or upload a
            photo instead.
          </p>
        ) : (
          <>
            <img src={figureIcon} width={150} height={285} alt="" />
            {mode === 'starting' && (
              <p role="status" className="absolute bottom-4 text-[15px] text-ash">
                Starting camera…
              </p>
            )}
          </>
        )}
      </div>

      {/* The shutter: the first press opens the camera, the second takes
          the photo. Its name changes so screen readers say what it'll do. */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={mode === 'live' ? takePhoto : openCamera}
          disabled={mode === 'starting'}
          className="flex size-[78px] items-center justify-center rounded-full border-4 border-paper disabled:opacity-50"
        >
          <span className="size-[60px] rounded-full bg-paper" />
          <span className="sr-only">{shutterLabel}</span>
        </button>
      </div>

      {/* Upload: a <label> for a hidden file input. With no `capture`
          attribute, phones offer the photo library (and the camera too). */}
      <label className="flex h-11 cursor-pointer items-center justify-center rounded-[14px] text-[15px] font-semibold text-paper underline underline-offset-4 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue-400">
        Upload a photo instead
        <input type="file" accept="image/*" onChange={handleUpload} className="sr-only" />
      </label>

      <a
        href={routeHref('home')}
        className="flex h-11 items-center justify-center rounded-[14px] text-[15px] font-semibold text-paper"
      >
        Not dressed yet? Remind me later
      </a>
    </div>
  )
}
