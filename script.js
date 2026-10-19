/* Native anchors and FAQ details work without JavaScript. */
const contentsLinks = Array.from(document.querySelectorAll('.contents nav a'));
const headings = contentsLinks.map(link => document.getElementById(link.hash.slice(1)));
let scrollFramePending = false;

function updateReadingLocation() {
  const readingLine = Math.min(window.innerHeight * 0.25, 160);
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const positions = headings.map(heading => heading
    ? heading.getBoundingClientRect().top + window.scrollY - readingLine
    : Infinity);

  // Short final sections cannot reach the normal reading line. Fit their
  // activation points into the remaining scroll distance, keeping their order.
  const lastPosition = positions[positions.length - 1];
  if (lastPosition > maxScroll) {
    let lastReachable = -1;
    positions.forEach((position, index) => {
      if (position <= maxScroll) lastReachable = index;
    });
    const start = lastReachable >= 0 ? Math.max(0, positions[lastReachable]) : 0;
    const scale = (maxScroll - start) / (lastPosition - start);
    positions.forEach((position, index) => {
      if (position > start) positions[index] = start + (position - start) * scale;
    });
  }

  let current = -1;
  positions.forEach((position, index) => {
    if (window.scrollY >= position - 1) current = index;
  });
  contentsLinks.forEach((link, index) => {
    if (index === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollFramePending = false;
}

function queueReadingLocation() {
  if (!scrollFramePending) {
    scrollFramePending = true;
    window.requestAnimationFrame(updateReadingLocation);
  }
}

// Checking eight headings once per frame keeps long sections and upward scrolling accurate.
window.addEventListener('scroll', queueReadingLocation, { passive: true });
window.addEventListener('resize', queueReadingLocation);
window.addEventListener('load', queueReadingLocation);
document.addEventListener('toggle', queueReadingLocation, true);
updateReadingLocation();
