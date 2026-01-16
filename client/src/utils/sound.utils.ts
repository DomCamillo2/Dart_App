// Voice announcer utility using Web Speech API

const synth = window.speechSynthesis;

const getVoice = () => {
    const voices = synth.getVoices();
    // Prefer a British male voice for authenticity (e.g., "Google UK English Male" or similar)
    const preferred = voices.find(v => v.lang.includes('en-GB') && v.name.includes('Male')) 
                   || voices.find(v => v.lang.includes('en-GB')) 
                   || voices.find(v => v.lang.includes('en-US'));
    return preferred;
}

export const announceScore = (score: number) => {
    if (score === 0 || !synth) return;

    // Throttle slightly to avoid overlap spam
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(score.toString());
    const voice = getVoice();
    if (voice) utterance.voice = voice;

    // Special exciting variants
    if (score === 180) {
        utterance.text = "ONE HUNDRED AND EIGHTY!";
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        utterance.volume = 1;
    } else if (score >= 100) {
        utterance.rate = 1;
        utterance.pitch = 1.1;
    } else {
        utterance.rate = 1.1;
    }

    synth.speak(utterance);
}

export const announceWinner = (name: string) => {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(`Game Shot! And the match to ${name}!`);
    const voice = getVoice();
    if (voice) utterance.voice = voice;
    utterance.pitch = 1.2;
    synth.speak(utterance);
}
