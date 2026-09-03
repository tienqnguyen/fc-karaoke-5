import { Muxer as Mp4Muxer, ArrayBufferTarget as Mp4ArrayBufferTarget } from 'mp4-muxer';
import { Muxer as WebmMuxer, ArrayBufferTarget as WebmArrayBufferTarget } from 'webm-muxer';

export interface WebCodecsExportOptions {
  canvas: HTMLCanvasElement;
  renderFrame: (time: number, freqData?: Uint8Array) => void;
  audioUrl: string;
  fps: number;
  width: number;
  height: number;
  startTime: number;
  endTime: number;
  quality: 'ultra' | 'high' | 'medium' | 'low';
  codecPreference: 'auto' | 'mp4' | 'webm_vp8' | 'webm_vp9';
  enableFadeIn?: boolean;
  fadeInDuration?: number;
  enableFadeOut?: boolean;
  fadeOutDuration?: number;
  onProgress?: (progress: number, currentFrame: number, totalFrames: number) => void;
  signal?: AbortSignal;
}

export function isWebCodecsSupported(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).VideoEncoder !== 'undefined';
}

class AnalyserSimulator {
  private smoothingTimeConstant = 0.8;
  private minDecibels = -100;
  private maxDecibels = -30;
  private fftSize = 256;
  private previousSmoothed: Float32Array;

  constructor() {
    this.previousSmoothed = new Float32Array(this.fftSize / 2);
    this.previousSmoothed.fill(-100);
  }

  getByteFrequencyData(
    samples: Float32Array,
    sampleRate: number,
    time: number,
    outputArray: Uint8Array
  ): void {
    const N = this.fftSize;
    const halfN = N / 2;
    let endIdx = Math.floor(time * sampleRate);
    let startIdx = endIdx - N;
    const windowed = new Float32Array(N);
    
    for (let i = 0; i < N; i++) {
      const idx = startIdx + i;
      let val = 0;
      if (idx >= 0 && idx < samples.length) {
        val = samples[idx];
      }
      const w = 0.42 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1)) + 0.08 * Math.cos((4 * Math.PI * i) / (N - 1));
      windowed[i] = val * w;
    }
    
    for (let k = 0; k < halfN; k++) {
      let sumReal = 0;
      let sumImag = 0;
      for (let n = 0; n < N; n++) {
        const angle = (2 * Math.PI * k * n) / N;
        sumReal += windowed[n] * Math.cos(angle);
        sumImag -= windowed[n] * Math.sin(angle);
      }
      let mag = Math.sqrt(sumReal * sumReal + sumImag * sumImag) / N;
      mag = mag * 2; 
      let db = mag > 1e-10 ? 20 * Math.log10(mag) : this.minDecibels;
      let smoothed = this.smoothingTimeConstant * this.previousSmoothed[k] + (1 - this.smoothingTimeConstant) * db;
      this.previousSmoothed[k] = smoothed;
      let byteVal = 255 * (smoothed - this.minDecibels) / (this.maxDecibels - this.minDecibels);
      byteVal = Math.min(255, Math.max(0, byteVal));
      outputArray[k] = Math.floor(byteVal);
    }
  }
}

export async function exportWithWebCodecs(options: WebCodecsExportOptions): Promise<{ blob: Blob; filename: string }> {
  const {
    canvas,
    renderFrame,
    audioUrl,
    fps,
    width,
    height,
    startTime,
    endTime,
    quality,
    codecPreference,
    enableFadeIn = false,
    fadeInDuration = 0,
    enableFadeOut = false,
    fadeOutDuration = 0,
    onProgress,
    signal
  } = options;

  if (!isWebCodecsSupported()) {
    throw new Error("Trình duyệt không hỗ trợ WebCodecs API (VideoEncoder).");
  }

  // 1. Fetch & Decode Audio Data
  const audioResponse = await fetch(audioUrl);
  const audioArrayBuffer = await audioResponse.arrayBuffer();
  
  const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioCtxClass();
  const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);
  
  const audioSampleRate = audioBuffer.sampleRate;
  const audioChannels = audioBuffer.numberOfChannels;
  const ch0 = audioBuffer.getChannelData(0);
  const ch1 = audioChannels > 1 ? audioBuffer.getChannelData(1) : ch0;

  // 2. Select Video & Audio Codecs
  const bitrateMap: Record<string, number> = {
    ultra: 14_000_000,
    high: 8_000_000,
    medium: 5_000_000,
    low: 2_500_000
  };
  const videoBitrate = bitrateMap[quality] || 8_000_000;

  const isMp4Preferred = codecPreference === 'mp4' || codecPreference === 'auto';
  
  // Test AVC / H.264 support
  let useMp4 = false;
  let videoCodecString = 'avc1.640028'; // H.264 High Profile
  
  if (isMp4Preferred) {
    try {
      const support = await (window as any).VideoEncoder.isConfigSupported({
        codec: 'avc1.640028',
        width,
        height,
        bitrate: videoBitrate,
        framerate: fps
      });
      if (support.supported) {
        useMp4 = true;
        videoCodecString = 'avc1.640028';
      } else {
        const supportBaseline = await (window as any).VideoEncoder.isConfigSupported({
          codec: 'avc1.42001f',
          width,
          height,
          bitrate: videoBitrate,
          framerate: fps
        });
        if (supportBaseline.supported) {
          useMp4 = true;
          videoCodecString = 'avc1.42001f';
        }
      }
    } catch {
      useMp4 = false;
    }
  }

  // Fallback to VP9 or VP8 WebM if MP4 is not preferred or not supported
  let webmCodec = 'V_VP9';
  if (!useMp4) {
    if (codecPreference === 'webm_vp8') {
      videoCodecString = 'vp8';
      webmCodec = 'V_VP8';
    } else {
      videoCodecString = 'vp09.00.10.08';
      webmCodec = 'V_VP9';
    }
  }

  // 3. Initialize Muxer
  let muxer: any;
  if (useMp4) {
    muxer = new Mp4Muxer({
      target: new Mp4ArrayBufferTarget(),
      video: {
        codec: 'avc',
        width,
        height
      },
      audio: {
        codec: 'aac',
        numberOfChannels: Math.min(2, audioChannels),
        sampleRate: audioSampleRate
      },
      fastStart: 'in-memory',
      firstTimestampBehavior: 'offset'
    });
  } else {
    muxer = new WebmMuxer({
      target: new WebmArrayBufferTarget(),
      video: {
        codec: webmCodec as any,
        width,
        height,
        frameRate: fps
      },
      audio: {
        codec: 'A_OPUS',
        numberOfChannels: Math.min(2, audioChannels),
        sampleRate: 48000
      }
    });
  }

  // 4. Initialize VideoEncoder
  const videoEncoder = new (window as any).VideoEncoder({
    output: (chunk: any, meta: any) => muxer.addVideoChunk(chunk, meta),
    error: (e: any) => console.error("WebCodecs VideoEncoder error:", e)
  });

  videoEncoder.configure({
    codec: videoCodecString,
    width,
    height,
    bitrate: videoBitrate,
    framerate: fps,
    hardwareAcceleration: 'prefer-hardware',
    avc: useMp4 ? { format: 'avc' } : undefined
  });

  // 5. Initialize & Encode Audio with AudioEncoder if available
  const canEncodeAudio = typeof (window as any).AudioEncoder !== 'undefined';
  let audioEncoder: any = null;

  if (canEncodeAudio) {
    try {
      const audioCodec = useMp4 ? 'mp4a.40.2' : 'opus';
      const targetAudioSampleRate = useMp4 ? audioSampleRate : 48000;
      const targetAudioChannels = Math.min(2, audioChannels);

      audioEncoder = new (window as any).AudioEncoder({
        output: (chunk: any, meta: any) => muxer.addAudioChunk(chunk, meta),
        error: (e: any) => console.warn("AudioEncoder error:", e)
      });

      audioEncoder.configure({
        codec: audioCodec,
        numberOfChannels: targetAudioChannels,
        sampleRate: targetAudioSampleRate,
        bitrate: 192_000
      });

      // Slice audio samples from startTime to endTime
      const startSample = Math.floor(startTime * audioSampleRate);
      const endSample = Math.min(ch0.length, Math.floor(endTime * audioSampleRate));
      const totalAudioSamples = Math.max(0, endSample - startSample);

      const chunkSize = 1024;
      const ch0Slice = new Float32Array(totalAudioSamples);
      const ch1Slice = new Float32Array(totalAudioSamples);

      for (let i = 0; i < totalAudioSamples; i++) {
        const srcIdx = startSample + i;
        const timeSec = startTime + (i / audioSampleRate);
        
        // Calculate Fade In / Fade Out Volume Gain
        let gain = 1.0;
        if (enableFadeIn && fadeInDuration > 0) {
          const tFadeIn = timeSec - startTime;
          if (tFadeIn < fadeInDuration) {
            gain = Math.max(0, tFadeIn / fadeInDuration);
          }
        }
        if (enableFadeOut && fadeOutDuration > 0) {
          const tFadeOut = endTime - timeSec;
          if (tFadeOut < fadeOutDuration) {
            gain = Math.min(gain, Math.max(0, tFadeOut / fadeOutDuration));
          }
        }

        ch0Slice[i] = (ch0[srcIdx] || 0) * gain;
        ch1Slice[i] = (ch1[srcIdx] || 0) * gain;
      }

      // Feed chunks into AudioEncoder
      for (let offset = 0; offset < totalAudioSamples; offset += chunkSize) {
        if (signal?.aborted) throw new Error("Xuất video đã bị hủy");
        const currentChunkSize = Math.min(chunkSize, totalAudioSamples - offset);
        
        let audioDataChunk: any;
        const timestampUs = Math.round((offset / audioSampleRate) * 1_000_000);

        if (targetAudioChannels === 1) {
          const monoData = ch0Slice.subarray(offset, offset + currentChunkSize);
          audioDataChunk = new (window as any).AudioData({
            format: 'f32-planar',
            sampleRate: audioSampleRate,
            numberOfFrames: currentChunkSize,
            numberOfChannels: 1,
            timestamp: timestampUs,
            data: monoData
          });
        } else {
          const planarData = new Float32Array(currentChunkSize * 2);
          planarData.set(ch0Slice.subarray(offset, offset + currentChunkSize), 0);
          planarData.set(ch1Slice.subarray(offset, offset + currentChunkSize), currentChunkSize);

          audioDataChunk = new (window as any).AudioData({
            format: 'f32-planar',
            sampleRate: audioSampleRate,
            numberOfFrames: currentChunkSize,
            numberOfChannels: 2,
            timestamp: timestampUs,
            data: planarData
          });
        }

        audioEncoder.encode(audioDataChunk);
        audioDataChunk.close();
      }

      await audioEncoder.flush();
    } catch (audioErr) {
      console.warn("Could not encode audio track via WebCodecs (continuing with video track):", audioErr);
      audioEncoder = null;
    }
  }

  // 6. Frame-by-Frame Deterministic Render & Encode Loop
  const duration = Math.max(0.1, endTime - startTime);
  const totalFrames = Math.ceil(duration * fps);
  const freqBuffer = new Uint8Array(128);
  const analyserSim = new AnalyserSimulator();

  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    if (signal?.aborted) {
      videoEncoder.close();
      if (audioEncoder) audioEncoder.close();
      throw new Error("Xuất video đã bị hủy");
    }

    const frameTime = startTime + (frameIndex / fps);

    // Extract deterministic audio frequency spectrum for this exact millisecond
    analyserSim.getByteFrequencyData(ch0, audioSampleRate, frameTime, freqBuffer);

    // Render frame synchronously on canvas
    renderFrame(frameTime, freqBuffer);

    // Capture precise VideoFrame directly from canvas
    const timestampUs = Math.round((frameIndex / fps) * 1_000_000);
    const isKeyFrame = frameIndex % (fps * 2) === 0;

    const videoFrame = new (window as any).VideoFrame(canvas, { timestamp: timestampUs });
    videoEncoder.encode(videoFrame, { keyFrame: isKeyFrame });
    videoFrame.close();

    // Progress update
    if (onProgress && (frameIndex % Math.max(1, Math.floor(fps / 4)) === 0 || frameIndex === totalFrames - 1)) {
      const percent = Math.min(99, Math.round(((frameIndex + 1) / totalFrames) * 100));
      onProgress(percent, frameIndex + 1, totalFrames);
    }

    // Throttle encoder to prevent queue overflow and dropped frames
    while (videoEncoder.encodeQueueSize > 5) {
      await new Promise(resolve => setTimeout(resolve, 5));
    }

    // Yield control periodically so UI remains ultra-smooth (use setTimeout to not stall in background tabs)
    if (frameIndex % Math.max(1, Math.floor(fps / 10)) === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  // 7. Flush & Finalize
  await videoEncoder.flush();
  videoEncoder.close();
  if (audioEncoder) {
    try {
      audioEncoder.close();
    } catch {}
  }

  muxer.finalize();
  const buffer = muxer.target.buffer;
  const mimeType = useMp4 ? 'video/mp4' : 'video/webm';
  const blob = new Blob([buffer], { type: mimeType });
  const filename = `karaoke_${Math.floor(Date.now() / 1000)}.${useMp4 ? 'mp4' : 'webm'}`;

  if (onProgress) {
    onProgress(100, totalFrames, totalFrames);
  }

  return { blob, filename };
}
