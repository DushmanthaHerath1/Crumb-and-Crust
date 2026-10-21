import HeroBg from "../assets/images/hero-bg.png";
import Button from "./ui/Button";

export default function HeroSection() {
  const handleClick = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section
        id="home"
        className="flex flex-col justify-end px-5 pb-12 md:px-20 min-h-138 md:min-h-125 lg:min-h-168"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(19,19,19,0.9) 0%, rgba(19,19,19,0.2) 100%), url(${HeroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex flex-col gap-6 max-w-sm md:max-w-lg">
          <h2 className="font-heading font-bold tracking-tight text-on-surface text-4xl leading-relaxed md:text-5xl md:leading-snug lg:text-6xl">
            Artisanal Bakes,
            <br />
            Crafted in Fitzroy.
          </h2>

          <div className="flex items-start">
            <Button
              onClick={handleClick}
              variant="primary"
              size="lg"
              className="w-auto text-lg md:text-xl transition-transform duration-300 hover:scale-105"
            >
              Pre-order for Pickup
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
