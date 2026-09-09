import HeroBg from "../assets/images/hero-bg.png";

export default function HeroSection() {
  return (
    <>
      <section
        className="flex flex-col justify-end px-5 pb-12 md:px-20 min-h-[552px] md:min-h-[500px] lg:min-h-[672px]"
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
            <button className="font-body font-normal text-xl rounded-md py-4 px-8 bg-primary-container text-on-primary-container transition-all duration-300 ease-in-out hover:scale-105 hover:cursor-pointeractive:scale-95 ">
              Pre-order for Pickup
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
