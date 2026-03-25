const express = require("express");
const sdk = require("microsoft-cognitiveservices-speech-sdk");

const app = express();
const PORT = 7070;

const SPEECH_KEY = "AA6d1MqYLUpElYhQTRjnQXNrhcT9fohUIdrCMtOCAnN63CI7yupNJQQJ99CCACYeBjFXJ3w3AAAYACOGT1XT";
const SPEECH_REGION = "eastus";

const VOICES = {
  "ja-JP": "ja-JP-AoiNeural",
  "ja-JP-male": "ja-JP-KeitaNeural",
  "en-US": "en-US-JennyNeural",
  "en-US-male": "en-US-GuyNeural",
  "ko-KR": "ko-KR-SunHiNeural"
};

app.get("/tts", (req, res) => {
  const text = req.query.text;
  const voice = VOICES[req.query.voice || "ja-JP"] || req.query.voice || VOICES["ja-JP"];

  if (!text) return res.status(400).send("text parameter required");

  const speechConfig = sdk.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
  speechConfig.speechSynthesisVoiceName = voice;
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

  synthesizer.speakTextAsync(
    text,
    (result) => {
      if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
        res.set({ "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" });
        res.send(Buffer.from(result.audioData));
      } else {
        res.status(500).send("TTS failed: " + result.errorDetails);
      }
      synthesizer.close();
    },
    (err) => {
      res.status(500).send("Error: " + err);
      synthesizer.close();
    }
  );
});

app.listen(PORT, () => console.log(`TTS server running at http://localhost:${PORT}/tts`));
