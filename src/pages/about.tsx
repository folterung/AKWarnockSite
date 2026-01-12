import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { images, authorInfo } from '../data/about';
import { GetStaticProps } from 'next';

interface AboutPageProps {
  images: typeof images;
  authorInfo: typeof authorInfo;
}

export default function About({ images, authorInfo }: AboutPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <>
      <Head>
        <title>{authorInfo.title}</title>
        <meta name="description" content={authorInfo.description} />
      </Head>

      <div className="min-h-screen">
        <Header />
        
        <main className="container mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold text-center mb-8">{authorInfo.title}</h1>
        
          {/* Image Gallery */}
          <div className="relative max-w-4xl mx-auto mb-16">
            <div className="relative h-[600px] rounded-lg overflow-hidden">
              {images.map((image, index) => (
                <div
                  key={image.src}
                  className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                    index === currentImageIndex ? 'translate-x-0' : 
                    index < currentImageIndex ? '-translate-x-full' : 'translate-x-full'
                  }`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={1200}
                    height={600}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
            
            {/* Navigation Buttons */}
            <button
              onClick={previousImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Next image"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>

          {/* Author Information */}
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-xl mx-auto">
              {authorInfo.content.map((paragraph, index) => (
                <React.Fragment key={index}>
                  <p className="text-lg">{paragraph.text}</p>
                  {index < authorInfo.content.length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      images,
      authorInfo,
    },
  };
}; 