import img1 from './assets/results/1.jpg';
import img2 from './assets/results/2.jpg';
import img3 from './assets/results/3.jpg';
import img4 from './assets/results/4.jpg';
import img5 from './assets/results/5.jpg';
import img6 from './assets/results/6.jpg';
import img7 from './assets/results/7.jpg';
import img8 from './assets/results/8.jpg';
import img9 from './assets/results/9.jpg';
import img10 from './assets/results/10.jpg';

const RANGES = [
  { max: 20, images: [img1, img2] },    // 0–20%
  { max: 40, images: [img3, img4] },    // 21–40%
  { max: 60, images: [img5, img6] },    // 41–60%
  { max: 80, images: [img7, img8] },    // 61–80%
  { max: 100, images: [img9, img10] },  // 81–100%
];

export function getResultImages(percent) {
  const range = RANGES.find((r) => percent <= r.max) ?? RANGES[RANGES.length - 1];
  return range.images;
}
