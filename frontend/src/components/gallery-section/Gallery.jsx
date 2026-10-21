import React from "react";
import { instagramPosts } from "./images";

export default function InstagramFeedSection() {
  return (
    <section
      id="gallery"
      className="w-full bg-surface-container-lowest py-16 md:py-section-gap"
    >
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 px-5 md:px-20 text-center">
          <h3 className="font-heading font-bold text-3xl md:text-4xl leading-tight text-on-surface">
            Follow our daily bakes
          </h3>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-body-lg text-primary transition-colors hover:text-primary-container hover:underline"
          >
            @crumbandcrust_fitzroy
          </a>
        </div>

        {/* Image Grid */}
        <div className="flex flex-row gap-5 overflow-x-auto px-5 md:px-20 pb-4 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {instagramPosts.map((post) => (
            <div
              key={post.id}
              className="aspect-square w-64 md:w-72 lg:w-80 shrink-0 overflow-hidden rounded-md snap-start bg-surface-container"
            >
              <img
                src={post.src}
                alt={post.alt}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
