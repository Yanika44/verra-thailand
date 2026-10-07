"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [current, setCurrent] = useState(0);
  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-sheet">
        <Image
          key={images[current]}
          src={images[current]}
          alt={`${alt} รูปที่ ${current + 1}`}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-3">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`ดูรูปที่ ${i + 1}`}
                aria-current={i === current}
                className="relative block aspect-[4/3] w-20 overflow-hidden rounded-xl opacity-60 ring-2 ring-transparent transition hover:opacity-100 aria-[current=true]:opacity-100 aria-[current=true]:ring-plum sm:w-24"
              >
                <Image src={src} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
