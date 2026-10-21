import React from "react";
import { Navigation } from "lucide-react";

export default function BakeryLocation() {
  return (
    <section
      id="location"
      className="w-full bg-surface px-5 py-16 md:px-20 md:py-section-gap"
    >
      <div className="flex flex-col gap-8">
        <h3 className="font-heading font-bold text-3xl md:text-4xl leading-tight text-primary">
          Our Location
        </h3>

        {/* Map + Info Card */}
        <div className="flex flex-col md:flex-row overflow-hidden rounded-md border border-white/10 bg-surface-container shadow-xl shadow-black/25">
          <div className="w-full md:w-3/5 min-h-80 md:min-h-105 bg-surface-container-highest">
            <iframe
              title="Crumb & Crust Location Map"
              src="https://maps.google.com/maps?q=123+Gertrude+St,+Fitzroy+VIC+3065&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full min-h-80 md:min-h-full border-0 filter invert-[0.9] hue-rotate-180 contrast-125 grayscale-[0.2]"
              loading="lazy"
            />
          </div>

          <div className="w-full md:w-2/5 flex flex-col justify-center gap-8 p-6 md:p-12">
            <div className="flex flex-col gap-2">
              <h4 className="font-heading font-bold text-2xl text-on-surface">
                Contact US
              </h4>
              <p className="font-body text-base leading-relaxed text-on-surface-variant">
                03 5550 5082
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-heading font-bold text-2xl text-on-surface">
                Visit Us in Fitzroy
              </h4>
              <p className="font-body text-base leading-relaxed text-on-surface-variant">
                123 Gertrude St,
                <br />
                Fitzroy VIC 3065,
                <br />
                Melbourne
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-label-caps text-primary">Opening Hours</p>
              <div className="flex items-center justify-between font-body text-base text-on-surface-variant">
                <span>Monday - Sunday</span>
                <span>7:00am - 3:00pm</span>
              </div>
            </div>

            <a
              href="https://www.google.com/maps/dir/?api=1&destination=123+Gertrude+St,+Fitzroy+VIC+3065"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-primary hover:text-primary-container transition-colors w-fit font-body text-base font-medium"
            >
              <Navigation
                size={18}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
              <span>Get Directions</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
