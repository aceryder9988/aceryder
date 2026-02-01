// Elements
const textInput = document.getElementById('textInput');
const speakBtn = document.getElementById('speakBtn');
const downloadBtn = document.getElementById('downloadBtn');
const voiceSelect = document.getElementById('voiceSelect');
const rate = document.getElementById('rate');
const pitch = document.getElementById('pitch');
const rateValue = document.getElementById('rateValue');
const pitchValue = document.getElementById('pitchValue');

let voices = [];
function loadVoices() {
    voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
}
speechSynthesis.onvoiceschanged = loadVoices;

// Sliders
rate.addEventListener('input', () => rateValue.textContent = rate.value);
pitch.addEventListener('input', () => pitchValue.textContent = pitch.value);

// Speak function
speakBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if(!text) return alert("Please enter some text!");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voices[voiceSelect.value];
    utterance.rate = parseFloat(rate.value);
    utterance.pitch = parseFloat(pitch.value);
    speechSynthesis.speak(utterance);
});

// Download function using Web Audio API + MediaRecorder
downloadBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if(!text) return alert("Please enter some text!");

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voices[voiceSelect.value];
    utterance.rate = parseFloat(rate.value);
    utterance.pitch = parseFloat(pitch.value);

    const audioContext = new AudioContext();
    const dest = audioContext.createMediaStreamDestination();
    const synth = window.speechSynthesis;

    const source = audioContext.createMediaStreamSource(dest.stream);
    const mediaRecorder = new MediaRecorder(dest.stream);
    let chunks = [];

    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = e => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tts.wav';
        a.click();
    };

    // Connect utterance to audio destination
    const utterClone = new SpeechSynthesisUtterance(utterance.text);
    utterClone.voice = utterance.voice;
    utterClone.rate = utterance.rate;
    utterClone.pitch = utterance.pitch;

    // Play and record
    synth.speak(utterClone);
    mediaRecorder.start();
    utterClone.onend = () => mediaRecorder.stop();
});
