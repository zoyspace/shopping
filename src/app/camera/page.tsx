"use client";

import { useEffect, useRef, useState } from "react";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  // カメラ起動
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }, // "environment" で背面カメラ
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("カメラ起動に失敗:", err);
      }
    };

    startCamera();
  }, []);

  // 写真を撮る処理
  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Base64形式の画像を保存
    const imageData = canvas.toDataURL("image/png");
    setPhoto(imageData);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <h1 className="text-xl font-bold">📸 写真を撮る</h1>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded border max-w-md w-full"
      />

      <button
        type="button"
        onClick={handleCapture}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        写真を撮る
      </button>

      <canvas ref={canvasRef} className="hidden" />

      {photo && (
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-lg">撮影した写真</h2>
          <img src={photo} alt="撮影画像" className="rounded border max-w-md w-full" />
          <a href={photo} download="photo.png" className="text-blue-600 underline">
            画像を保存する
          </a>
        </div>
      )}
    </main>
  );
}
