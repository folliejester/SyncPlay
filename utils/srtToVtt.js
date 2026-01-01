function toVttTime(srtTime) {
  return srtTime.replace(',', '.');
}
module.exports = function srtToVtt(srt) {
  const lines = srt.replace(/\r/g, '').split('\n');
  const out = ['WEBVTT', ''];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (/^\d+$/.test(line)) {
      i++;
      continue;
    }
    if (line.includes('-->')) {
      const timeLine = line
        .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, (_, hhmmss, ms) => `${hhmmss}.${ms}`)
        .replace(/\s+/g, ' ');
      out.push(timeLine);
      i++;
      while (i < lines.length && lines[i].trim() !== '') {
        out.push(lines[i]);
        i++;
      }
      out.push('');
    } else {
      i++;
    }
  }
  return out.join('\n');
};
