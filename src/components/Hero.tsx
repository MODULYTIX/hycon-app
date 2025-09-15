import HeroBackground from '../assets/images/hero-background.webp';

export default function Hero() {
  return (
    <div className="relative h-full w-full">
      <img
        src={HeroBackground}
        alt="Hero Background"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex items-center justify-center h-full text-white">
        <h1 className="text-4xl font-bold">En proceso...</h1>
      </div>
    </div>
  );
}
